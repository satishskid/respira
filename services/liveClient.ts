
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserPreferences, RoutineMode } from '../types';
import { MODEL_NAME, getSystemInstruction, tools } from '../constants';
import { createBlob, base64ToUint8Array, decodeAudioData } from './audioUtils';

export interface LiveClientCallbacks {
  onConnectionUpdate: (connected: boolean) => void;
  onVolumeUpdate: (volume: number) => void;
  onError: (error: string) => void;
  onTranscriptUpdate: (text: string) => void;
  onUserTranscriptUpdate: (text: string) => void;
  onExerciseUpdate: (name: string, pattern: string) => void;
}

export class LiveClient {
  private ai: GoogleGenAI | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private session: any = null; 
  private processor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private callbacks: LiveClientCallbacks;
  private isProcessing = false;

  constructor(callbacks: LiveClientCallbacks) {
    this.callbacks = callbacks;
  }

  // ROBUSTNESS: iOS Safari requires AudioContext to be resumed on user gesture.
  async resumeAudioContext() {
    if (this.outputAudioContext && this.outputAudioContext.state === 'suspended') {
      await this.outputAudioContext.resume();
    }
  }

  async connect(preferences: UserPreferences, routineMode: RoutineMode) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // API Key: Exclusively from process.env.API_KEY
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("Missing API Key. Ensure process.env.API_KEY is configured.");
      }

      this.ai = new GoogleGenAI({ apiKey });

      // Initialize Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      // Get Microphone Stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start Session with Gemini
      const sessionPromise = this.ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: preferences.voiceName || 'Kore' } },
          },
          systemInstruction: getSystemInstruction(preferences, routineMode),
          outputAudioTranscription: {}, 
          inputAudioTranscription: {},  
          tools: tools,
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            this.callbacks.onConnectionUpdate(true);
            this.startAudioInputStream(sessionPromise);
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onclose: (e) => {
            console.log('Gemini Live Session Closed', e);
            this.disconnect();
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            this.callbacks.onError('Connection error. Check network.');
            this.disconnect();
          },
        },
      });

      this.session = sessionPromise;

    } catch (error: any) {
      console.error('Failed to connect:', error);
      this.callbacks.onError(error.message || 'Failed to connect to microphone or API.');
      this.disconnect();
    } finally {
      this.isProcessing = false;
    }
  }

  private startAudioInputStream(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.mediaStream) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.callbacks.onVolumeUpdate(rms);

      const pcmBlob = createBlob(inputData);
      
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      }).catch(err => {
         // Session might be closed
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    if (!this.outputAudioContext || !this.outputNode) return;

    const serverContent = message.serverContent;

    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'setBreathingExercise') {
          const args = fc.args as any;
          this.callbacks.onExerciseUpdate(args.name, args.pattern);
          
          this.session.then((s: any) => {
             s.sendToolResponse({
               functionResponses: {
                 id: fc.id,
                 name: fc.name,
                 response: { result: 'ok' }
               }
             });
          });
        }
      }
    }

    if (serverContent?.outputTranscription?.text) {
      this.callbacks.onTranscriptUpdate(serverContent.outputTranscription.text);
    }
    
    if (serverContent?.inputTranscription?.text) {
      this.callbacks.onUserTranscriptUpdate(serverContent.inputTranscription.text);
    }

    if (serverContent?.interrupted) {
      this.stopAllAudio();
      this.nextStartTime = 0;
      this.callbacks.onTranscriptUpdate(""); 
      return;
    }

    const modelTurn = serverContent?.modelTurn;
    if (modelTurn?.parts?.[0]?.inlineData?.data) {
      const base64Audio = modelTurn.parts[0].inlineData.data;
      
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      
      const audioBuffer = await decodeAudioData(
        base64ToUint8Array(base64Audio),
        this.outputAudioContext,
        24000,
        1
      );

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      
      source.onended = () => {
        this.activeSources.delete(source);
      };

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.activeSources.add(source);
    }
  }

  private stopAllAudio() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    this.activeSources.clear();
  }

  disconnect() {
    this.stopAllAudio();
    this.callbacks.onConnectionUpdate(false);
    this.callbacks.onVolumeUpdate(0);
    this.callbacks.onTranscriptUpdate("");
    this.callbacks.onExerciseUpdate("", ""); 

    if (this.session) {
       this.session.then((s: any) => {
           try { s.close(); } catch(e){}
       });
       this.session = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.inputSource) {
        this.inputSource.disconnect();
        this.inputSource = null;
    }
    if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
    }
    if (this.outputNode) {
        this.outputNode.disconnect();
        this.outputNode = null;
    }

    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
  }
}
