import React, { useState } from 'react';
import { UserPreferences, HealthCondition, UserProfile } from '../types';
import { HEALTH_CONDITIONS } from '../constants';
import { authService } from '../services/auth';

interface OnboardingModalProps {
  preferences: UserPreferences;
  onComplete: (prefs: UserPreferences) => void;
  isOpen: boolean;
  user: UserProfile | null;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ preferences, onComplete, isOpen, user }) => {
  const [step, setStep] = useState(0); // Start at 0 for Login
  const [tempPrefs, setTempPrefs] = useState<UserPreferences>(preferences);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleHealthToggle = (id: HealthCondition) => {
    const current = tempPrefs.healthConditions || [];
    const updated = current.includes(id) 
      ? current.filter(c => c !== id) 
      : [...current, id];
    setTempPrefs({ ...tempPrefs, healthConditions: updated });
  };

  const handleNext = () => setStep(step + 1);
  const handleFinish = () => onComplete({ ...tempPrefs, hasOnboarded: true });

  const handleGoogleLogin = async () => {
    setAuthError(null);
    if (!authService.isConfigured()) {
      // If user hasn't configured firebase, skip auth to prevent lock out
      console.warn("Firebase not configured, skipping auth step.");
      handleNext();
      return;
    }
    
    try {
      await authService.signInWithGoogle();
      handleNext();
    } catch (err: any) {
      // Display the friendly error message constructed in auth.ts
      setAuthError(err.message || "Sign in failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-6">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        
        {step === 0 && (
          <div className="animate-fade-in-up space-y-6 w-full">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border border-indigo-400/30">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-3xl font-light text-white tracking-wide">Initialize RESPIRA</h1>
            <p className="text-slate-400 leading-relaxed max-w-sm mx-auto">
              Sync your profile to begin bio-rhythm optimization.
            </p>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Sign in with Google
            </button>

            {authError && (
              <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-left">
                <p className="text-red-200 text-xs font-mono break-words">{authError}</p>
              </div>
            )}

            <button onClick={handleNext} className="text-slate-500 text-sm hover:text-white underline decoration-slate-700 underline-offset-4">
              Continue as Guest
            </button>
            
            {!authService.isConfigured() && (
               <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded text-xs text-amber-200 text-left">
                 <strong>Setup Required:</strong> Open <code>constants.ts</code> and paste your Firebase API keys.
               </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border border-indigo-400/30">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl">🧘</span>
              )}
            </div>
            <h1 className="text-3xl font-light text-white">Welcome, {user?.displayName ? user.displayName.split(' ')[0] : 'User'}</h1>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Let's calibrate the system to your bio-metrics.
            </p>
            <button onClick={handleNext} className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
              Begin Calibration
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up space-y-6 w-full text-left">
            <div>
               <h2 className="text-2xl font-semibold text-white mb-2">Safety Protocols</h2>
               <p className="text-slate-400 text-sm">Do you have any conditions that require protocol adjustment?</p>
            </div>
            
            <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-white/10">
              {HEALTH_CONDITIONS.map(cond => (
                <label key={cond.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{cond.label}</span>
                    <span className="text-[10px] text-slate-500">{cond.warning}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${tempPrefs.healthConditions?.includes(cond.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                    {tempPrefs.healthConditions?.includes(cond.id) && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <input type="checkbox" className="hidden" checked={tempPrefs.healthConditions?.includes(cond.id)} onChange={() => handleHealthToggle(cond.id)} />
                </label>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 text-center px-4">
              *Data is stored locally for safety adaptation logic only.
            </p>

            <button onClick={handleNext} className="w-full bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-500 transition-colors">
              Confirm & Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up space-y-8">
            <h2 className="text-2xl font-light text-white">System capabilities</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">🎤</div>
                <div>
                  <h3 className="font-semibold text-white">Voice Interface</h3>
                  <p className="text-sm text-slate-400">Natural language processing. Interrupt at will.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">👁️</div>
                <div>
                  <h3 className="font-semibold text-white">Visual Sync</h3>
                  <p className="text-sm text-slate-400">Phase-locked light guidance.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">🔒</div>
                <div>
                  <h3 className="font-semibold text-white">Encrypted Local</h3>
                  <p className="text-sm text-slate-400">Zero-knowledge storage architecture.</p>
                </div>
              </div>
            </div>

            <button onClick={handleFinish} className="w-full bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
              Launch System
            </button>
          </div>
        )}

        {/* Step dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;