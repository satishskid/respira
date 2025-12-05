
export type AmbientType = 'rain' | 'ocean' | 'forest' | 'off';

export class AmbientService {
  private ctx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private isPlaying: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.mainGain = this.ctx.createGain();
      this.mainGain.connect(this.ctx.destination);
      this.mainGain.gain.value = 0; // Start muted for fade in
    }
  }

  // Generate White Noise Buffer
  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Pink Noise Generator (Approximation)
  private createPinkNoise(): AudioNode {
    if (!this.ctx) throw new Error("No Context");
    const bufferSize = 4096;
    const node = this.ctx.createScriptProcessor(bufferSize, 1, 1);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    node.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
    };
    return node;
  }

  // Brown Noise Generator (Approximation)
  private createBrownNoise(): AudioNode {
    if (!this.ctx) throw new Error("No Context");
    const bufferSize = 4096;
    const node = this.ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0;
    node.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }
    };
    return node;
  }

  stop() {
    if (!this.isPlaying) return;
    
    // Fade out
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.mainGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        this.activeNodes.forEach(node => node.disconnect());
        this.activeNodes = [];
        // Close context to save resources? No, keep it open for reuse, just suspend.
        // this.ctx?.suspend();
      }, 1000);
    }
    this.isPlaying = false;
  }

  play(type: AmbientType) {
    this.init();
    if (!this.ctx || !this.mainGain) return;
    
    // Stop current if playing
    this.activeNodes.forEach(node => node.disconnect());
    this.activeNodes = [];

    if (type === 'off') {
        this.stop();
        return;
    }

    this.ctx.resume();
    this.isPlaying = true;

    // Reset Master Gain for fade in
    this.mainGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.mainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.mainGain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 2.0); // Master volume 0.3

    if (type === 'rain') {
        // Rain: Pink Noise through a slight LowPass
        const noise = this.createPinkNoise();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; // Muffle it a bit
        
        noise.connect(filter);
        filter.connect(this.mainGain);
        this.activeNodes.push(noise, filter);
    } 
    else if (type === 'ocean') {
        // Ocean: Brown Noise + LFO on Gain
        const noise = this.createBrownNoise();
        
        const waveGain = this.ctx.createGain();
        waveGain.gain.value = 0.5;
        
        // LFO for waves (0.1 Hz = 10 second cycle)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; 
        
        // Scale LFO to gain (0.2 to 0.8)
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.3; // Amplitude of wave
        lfo.connect(lfoGain);
        lfoGain.connect(waveGain.gain);
        
        lfo.start();
        
        // Static filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        noise.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(this.mainGain);
        
        this.activeNodes.push(noise, filter, waveGain, lfo, lfoGain);
    }
    else if (type === 'forest') {
        // Forest Stream: High-passed Brown Noise (Rushing water)
        const noise = this.createBrownNoise();
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 400;
        
        const filter2 = this.ctx.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.value = 1500;

        // Static low volume
        const streamGain = this.ctx.createGain();
        streamGain.gain.value = 0.4;

        noise.connect(filter);
        filter.connect(filter2);
        filter2.connect(streamGain);
        streamGain.connect(this.mainGain);
        
        this.activeNodes.push(noise, filter, filter2, streamGain);
    }
  }
}

export const ambientService = new AmbientService();
