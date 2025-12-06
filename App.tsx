import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LiveClient } from './services/liveClient';
import { dbService } from './services/db';
import { ambientService } from './services/ambientService';
import { authService } from './services/auth';
import { ConnectionState, UserPreferences, RoutineMode, AmbientSound, BeforeInstallPromptEvent, UserProfile } from './types';
import { DEFAULT_PREFERENCES, VOICE_OPTIONS, ROUTINE_OPTIONS, AMBIENT_SOUND_OPTIONS } from './constants';
import Visualizer from './components/Visualizer';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import OnboardingModal from './components/OnboardingModal';
import ScienceModal from './components/ScienceModal';
import AboutModal from './components/AboutModal';
import CircadianClock from './components/CircadianClock';
import BioIntelTicker from './components/BioIntelTicker';
import { useBreathingMonitor } from './hooks/useBreathingMonitor';
import { useStepCounter } from './hooks/useStepCounter';

interface ExerciseDetails {
  name: string;
  pattern: string;
}

const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volume, setVolume] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [routineMode, setRoutineMode] = useState<RoutineMode>('focus');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCircadianClockOpen, setIsCircadianClockOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const [instructionText, setInstructionText] = useState("");
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetails | null>(null);
  
  const [userTranscript, setUserTranscript] = useState(""); 
  
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const { isBreathing, consistencyScore } = useBreathingMonitor(volume, connectionState === ConnectionState.CONNECTED);
  const { steps, cadence, isSupported: isStepSupported, hasPermission: hasStepPermission, requestPermission: requestStepPermission } = useStepCounter(connectionState === ConnectionState.CONNECTED && routineMode === 'walk');

  const liveClientRef = useRef<LiveClient | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const hasAutoStartedRef = useRef<boolean>(false); // Track if welcome session started

  useEffect(() => {
    // DB Init
    dbService.init().then(() => {
      dbService.getPreferences().then(setPreferences);
    }).catch(err => console.error("DB Init failed", err));

    // Auth Listener
    const unsubscribe = authService.onAuthStateChange((userProfile) => {
      setUser(userProfile);
    });

    // PWA Install Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      unsubscribe();
    };
  }, []);

  // Auto-start welcome session after first onboarding
  useEffect(() => {
    if (preferences.hasOnboarded && !hasAutoStartedRef.current && connectionState === ConnectionState.DISCONNECTED) {
      const shouldAutoStart = localStorage.getItem('respira_welcome_completed') !== 'true';
      
      if (shouldAutoStart) {
        // Wait a bit for UI to settle, then auto-start
        const timer = setTimeout(() => {
          handleStartSession();
          hasAutoStartedRef.current = true;
          localStorage.setItem('respira_welcome_completed', 'true');
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [preferences.hasOnboarded, connectionState]);

  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
        ambientService.play(preferences.ambientSound);
        setIsAmbientPlaying(preferences.ambientSound !== 'off');
    } else {
        ambientService.stop();
        setIsAmbientPlaying(false);
    }
  }, [connectionState, preferences.ambientSound]);

  useEffect(() => {
    liveClientRef.current = new LiveClient({
      onConnectionUpdate: (connected) => {
        setConnectionState(connected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED);
        if (connected) {
          sessionStartTimeRef.current = Date.now();
          setUserTranscript("");
          setIsMuted(false);
        } else {
          setInstructionText("");
          setExerciseDetails(null);
        }
      },
      onVolumeUpdate: (vol) => {
        if (!isMuted) setVolume(vol);
        else setVolume(0);
      },
      onError: (msg) => {
        setErrorMessage(msg);
        setConnectionState(ConnectionState.ERROR);
      },
      onTranscriptUpdate: (text) => {
        setInstructionText(prev => {
          if (text === "") return "";
          let next = prev + text;
          if (next.length > 180) {
            next = next.slice(next.length - 180);
            const firstSpace = next.indexOf(' ');
            if (firstSpace > 0 && firstSpace < 20) {
               next = "..." + next.slice(firstSpace);
            }
          }
          return next;
        });
      },
      onUserTranscriptUpdate: (text) => {
        if (routineMode === 'night') {
            setUserTranscript(prev => prev + " " + text);
        }
      },
      onExerciseUpdate: (name, pattern) => {
        if (name && pattern) {
          setExerciseDetails({ name, pattern });
        } else {
          setExerciseDetails(null);
        }
      }
    });

    return () => {
      if (liveClientRef.current) {
        liveClientRef.current.disconnect();
      }
      ambientService.stop();
    };
  }, [routineMode, isMuted]); 

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    dbService.savePreferences(newPrefs).catch(console.error);
  };

  const handleStartSession = useCallback(async () => {
    setErrorMessage(null);
    setConnectionState(ConnectionState.CONNECTING);
    if (liveClientRef.current) {
      await liveClientRef.current.resumeAudioContext();
      await liveClientRef.current.connect(preferences, routineMode);
    }
  }, [preferences, routineMode]);

  const handleEndSession = useCallback(async () => {
    if (liveClientRef.current) {
      liveClientRef.current.disconnect();
    }
    
    if (sessionStartTimeRef.current) {
      const durationSeconds = (Date.now() - sessionStartTimeRef.current) / 1000;
      if (durationSeconds > 15) {
        await dbService.logSession({
          timestamp: Date.now(),
          durationSeconds,
          focus: routineMode, 
          techniqueUsed: exerciseDetails?.name || undefined
        });

        if (routineMode === 'night' && userTranscript.trim().length > 10) {
           await dbService.saveJournalEntry({
             timestamp: Date.now(),
             text: userTranscript.trim(),
             tags: ['night', 'reflection']
           });
           console.log("Journal entry saved");
        }
      }
      sessionStartTimeRef.current = null;
    }
  }, [routineMode, exerciseDetails, userTranscript]);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    });
  };

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleHistory = () => setIsHistoryOpen(!isHistoryOpen);
  const toggleMute = () => setIsMuted(!isMuted);
  
  const toggleAmbient = () => {
      if (preferences.ambientSound === 'off') {
          handleUpdatePreferences({...preferences, ambientSound: 'rain'});
      } else {
          handleUpdatePreferences({...preferences, ambientSound: 'off'});
      }
  };

  const currentVoice = VOICE_OPTIONS.find(v => v.id === preferences.voiceName) || VOICE_OPTIONS[0];
  const currentAmbient = AMBIENT_SOUND_OPTIONS.find(a => a.id === preferences.ambientSound) || AMBIENT_SOUND_OPTIONS[1];

  const getGradient = () => {
    const routine = ROUTINE_OPTIONS.find(r => r.id === routineMode);
    return routine ? routine.color : 'from-indigo-900 to-slate-900';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden relative transition-colors duration-1000">
      
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${getGradient()} opacity-20 transition-all duration-1000 z-0 pointer-events-none`}></div>
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className={`relative z-10 px-6 py-4 flex justify-between items-center backdrop-blur-sm border-b border-white/5 transition-all duration-500 ${connectionState === ConnectionState.CONNECTED ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Me" className="w-8 h-8 rounded-full border border-white/30" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-teal-400 rounded-lg flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}
          <span className="font-semibold text-lg tracking-widest uppercase">RESPIRA</span>
        </div>
        
        <div className="flex gap-2 items-center">
           {/* Install Button */}
           {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="hidden md:block bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-full mr-2 transition-colors border border-white/20"
              >
                Install App
              </button>
           )}

           <button onClick={() => setIsCircadianClockOpen(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Circadian Clock">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </button>
           <button onClick={() => setIsAboutOpen(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="About RESPIRA">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </button>
           <button onClick={() => setIsScienceOpen(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Science & Methodology">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
             </svg>
           </button>
           <button onClick={toggleHistory} disabled={connectionState !== ConnectionState.DISCONNECTED} className={`p-2 rounded-full hover:bg-white/10 transition-colors`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button onClick={toggleSettings} disabled={connectionState !== ConnectionState.DISCONNECTED} className={`p-2 rounded-full hover:bg-white/10 transition-colors`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-6 pb-28 w-full max-w-lg mx-auto">
        
        {/* Status */}
        <div className="absolute top-4 text-center w-full pointer-events-none">
          {connectionState === ConnectionState.CONNECTING && (
            <p className="text-white/70 animate-pulse font-medium tracking-wide text-xs uppercase">Initializing System...</p>
          )}
          {connectionState === ConnectionState.ERROR && (
             <div className="inline-block bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg pointer-events-auto backdrop-blur-md">
               {errorMessage || 'System Error.'}
             </div>
          )}
        </div>

        {/* Visualizer & Biofeedback */}
        <div className={`relative w-full aspect-square flex flex-col items-center justify-center mb-4 transition-all duration-700 ${connectionState === ConnectionState.CONNECTED ? 'scale-110' : 'scale-100'}`}>
          <Visualizer 
            volume={volume} 
            isActive={connectionState === ConnectionState.CONNECTED}
            breathingPattern={exerciseDetails?.pattern}
          />
          
          {/* Pedometer */}
          {connectionState === ConnectionState.CONNECTED && routineMode === 'walk' && (
             <div className="absolute top-4 left-4 flex flex-col items-start gap-2 pointer-events-auto animate-fade-in">
               {!hasStepPermission && isStepSupported && (
                  <button onClick={requestStepPermission} className="bg-emerald-600/80 hover:bg-emerald-500 text-xs text-white px-3 py-1.5 rounded-full backdrop-blur-sm border border-emerald-400/30">
                     Enable Sensors
                  </button>
               )}
               {hasStepPermission && (
                  <div className="bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 text-xs">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-400 font-bold text-lg">{cadence}</span>
                        <span className="opacity-70">SPM</span>
                     </div>
                     <div className="opacity-50">Total: {steps}</div>
                  </div>
               )}
             </div>
          )}

          {connectionState === ConnectionState.DISCONNECTED && (
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="text-6xl mb-4 opacity-50 animate-float">
                    {ROUTINE_OPTIONS.find(r => r.id === routineMode)?.icon}
                 </div>
             </div>
          )}
        </div>
        
        {/* Biofeedback Bar */}
        {connectionState === ConnectionState.CONNECTED && (
            <div className="w-full max-w-[200px] mb-6 flex flex-col items-center gap-1 opacity-80 animate-fade-in">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-100 ${isBreathing ? 'bg-teal-400' : 'bg-slate-500'}`}
                        style={{ width: `${Math.min(100, volume * 500)}%` }}
                    />
                </div>
            </div>
        )}

        {/* Instructions */}
        <div className="w-full px-6 min-h-[6rem] flex flex-col items-center justify-center text-center">
            {connectionState === ConnectionState.CONNECTED ? (
              <div className="animate-fade-in-up flex flex-col items-center">
                 {instructionText && <p className="text-xl font-light text-white leading-relaxed drop-shadow-md">{instructionText}</p>}
                 
                 {/* Active Exercise Details */}
                 {exerciseDetails && (
                    <div className="mt-6 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center animate-fade-in backdrop-blur-sm w-full max-w-xs shadow-lg">
                      <div className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-1">Active Protocol</div>
                      <h3 className="text-lg font-semibold text-white">{exerciseDetails.name}</h3>
                      <div className="text-xs text-slate-400 font-mono mt-1 text-center leading-tight">
                        {exerciseDetails.pattern}
                      </div>
                    </div>
                 )}

                 {routineMode === 'night' && (
                    <div className="mt-4 flex items-center gap-2 justify-center text-xs text-purple-300 opacity-80">
                       <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                       Recording Log...
                    </div>
                 )}
              </div>
            ) : (
               <p className="text-slate-400 text-sm">Select protocol to initialize.</p>
            )}
        </div>

        {/* Routine Selector */}
        {connectionState === ConnectionState.DISCONNECTED && (
          <div className="w-full grid grid-cols-2 gap-3 mt-8">
            {ROUTINE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRoutineMode(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${
                   routineMode === opt.id 
                     ? `bg-gradient-to-br ${opt.color} border-white/20 shadow-lg text-white ring-2 ring-white/10` 
                     : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                 <div className="text-2xl mb-1">{opt.icon}</div>
                 <div className="font-semibold text-sm">{opt.label}</div>
              </button>
            ))}
            {/* Install Prompt for Mobile */}
            {deferredPrompt && (
               <button
                 onClick={handleInstallClick}
                 className="md:hidden col-span-2 p-3 rounded-xl border border-dashed border-white/30 text-center text-sm text-slate-300 hover:bg-white/5 flex items-center justify-center gap-2"
               >
                 <span>📲</span> Install RESPIRA
               </button>
            )}
          </div>
        )}

        {/* Start Button */}
        {connectionState === ConnectionState.DISCONNECTED && (
          <div className="mt-8 flex flex-col items-center gap-4 w-full">
            <button
              onClick={handleStartSession}
              className="w-full py-4 text-lg font-bold text-white transition-all bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md shadow-xl active:scale-95 uppercase tracking-widest"
            >
              Initiate {ROUTINE_OPTIONS.find(r => r.id === routineMode)?.label}
            </button>
            <div className="text-xs text-slate-500">Voice Model: {currentVoice.name}</div>
          </div>
        )}

      </main>

      {/* Floating Controls */}
      {connectionState === ConnectionState.CONNECTED && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
             <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors backdrop-blur-md border border-white/10 shadow-lg ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-black/20 text-white hover:bg-black/40'}`}
              >
                 {isMuted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                 ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 )}
              </button>

              <button 
                onClick={toggleAmbient} 
                className={`p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-colors ${preferences.ambientSound !== 'off' ? 'bg-teal-500/20 text-teal-300' : 'bg-black/20 text-slate-400 hover:bg-black/40'}`}
              >
                <span className="text-xl">{currentAmbient.icon}</span>
              </button>
        </div>
      )}

      {/* End Session Button */}
      {connectionState !== ConnectionState.DISCONNECTED && (
        <div className="fixed bottom-10 left-0 w-full flex justify-center z-50 px-4">
            <button
              onClick={handleEndSession}
              disabled={connectionState === ConnectionState.CONNECTING}
              className="px-8 py-4 text-lg font-bold text-white bg-red-600/90 rounded-full hover:bg-red-500 hover:scale-105 shadow-xl transition-all uppercase tracking-wide"
            >
              Terminate Session
            </button>
        </div>
      )}

      <OnboardingModal 
        isOpen={!preferences.hasOnboarded}
        preferences={preferences}
        onComplete={handleUpdatePreferences}
        user={user}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdate={handleUpdatePreferences}
      />

      <ScienceModal 
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
      />

      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Circadian Clock Modal */}
      {isCircadianClockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/20 p-6">
            <button
              onClick={() => setIsCircadianClockOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Your Circadian Clock</h2>
            <p className="text-sm text-gray-400 mb-6">5 protocols synced to your biological rhythm</p>
            <CircadianClock 
              currentProtocol={routineMode}
              onProtocolSelect={(protocolId) => {
                setRoutineMode(protocolId as RoutineMode);
                setIsCircadianClockOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Bio-Intel Daily Fact Ticker */}
      {preferences.hasOnboarded && connectionState === ConnectionState.DISCONNECTED && (
        <BioIntelTicker onLearnMore={() => setIsScienceOpen(true)} />
      )}
    </div>
  );
};

export default App;