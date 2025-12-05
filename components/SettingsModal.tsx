
import React from 'react';
import { UserPreferences, JournalPromptStyle, AmbientSound, BreathingRatio, HealthCondition } from '../types';
import { VOICE_OPTIONS, JOURNAL_PROMPT_OPTIONS, AMBIENT_SOUND_OPTIONS, BREATHING_RATIO_OPTIONS, HEALTH_CONDITIONS } from '../constants';

interface SettingsModalProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ preferences, onUpdate, isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = React.useState<string>('');
  const [isEditingApiKey, setIsEditingApiKey] = React.useState(false);
  const [apiKeyError, setApiKeyError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (key: keyof UserPreferences, value: any) => {
    onUpdate({ ...preferences, [key]: value });
  };

  const toggleHealthCondition = (conditionId: HealthCondition) => {
    const current = preferences.healthConditions || [];
    const updated = current.includes(conditionId)
      ? current.filter(c => c !== conditionId)
      : [...current, conditionId];
    handleChange('healthConditions', updated);
  };

  const handleApiKeyUpdate = () => {
    setApiKeyError(null);
    if (!apiKeyInput.trim()) {
      setApiKeyError("API key cannot be empty");
      return;
    }
    if (!apiKeyInput.startsWith('AIza')) {
      setApiKeyError("Invalid format. Gemini keys start with 'AIza'");
      return;
    }
    handleChange('geminiApiKey', apiKeyInput);
    setIsEditingApiKey(false);
    setApiKeyInput('');
  };

  const maskApiKey = (key: string | null) => {
    if (!key) return 'Not set';
    if (key.length < 10) return '••••••••';
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span>⚙️</span> Coach Settings
        </h2>
        
        <div className="space-y-8">
          
          {/* Medical Safety Section */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Safety & Contraindications
            </h3>
            <p className="text-xs text-slate-400 mb-3">Please select any conditions that apply. The AI will adapt exercises to ensure your safety (e.g., removing breath retention).</p>
            <div className="space-y-2">
              {HEALTH_CONDITIONS.map((cond) => (
                <label key={cond.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={preferences.healthConditions?.includes(cond.id)}
                      onChange={() => toggleHealthCondition(cond.id)}
                    />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="text-sm text-slate-200 group-hover:text-white font-medium">{cond.label}</span>
                    <p className="text-[10px] text-slate-500">{cond.warning}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* API Key Section */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Gemini API Key (BYOK)
            </h3>
            <p className="text-xs text-slate-400 mb-3">Your personal API key for AI voice coaching. Stored locally on your device only.</p>
            
            {!isEditingApiKey ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-slate-300 font-mono">{maskApiKey(preferences.geminiApiKey)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingApiKey(true);
                      setApiKeyInput(preferences.geminiApiKey || '');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Update
                  </button>
                </div>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  Get API Key from Google AI Studio
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setApiKeyError(null);
                  }}
                  placeholder="AIza..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
                />
                {apiKeyError && (
                  <p className="text-xs text-red-400">{apiKeyError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleApiKeyUpdate}
                    className="flex-1 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium"
                  >
                    Save Key
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingApiKey(false);
                      setApiKeyInput('');
                      setApiKeyError(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Environment</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange('environment', 'nature-walk')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  preferences.environment === 'nature-walk'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span>🌲</span> Nature Walk
              </button>
              <button
                onClick={() => handleChange('environment', 'seated-meditation')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  preferences.environment === 'seated-meditation'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span>🧘</span> Seated
              </button>
            </div>
          </div>

           {/* Breathing Ratio */}
           <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">Breathing Rhythm (Ratio)</label>
             <div className="grid grid-cols-2 gap-2">
                {BREATHING_RATIO_OPTIONS.map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => handleChange('breathingRatio', opt.id)}
                     className={`p-2 rounded-lg border text-left transition-colors flex flex-col justify-center ${
                       preferences.breathingRatio === opt.id
                         ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                         : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                     }`}
                   >
                     <span className="text-xs font-semibold mb-1">{opt.label}</span>
                     <span className="text-[10px] opacity-70 leading-tight">{opt.description}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* Ambient Sound */}
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">Ambient Soundscape</label>
             <div className="grid grid-cols-4 gap-2">
                {AMBIENT_SOUND_OPTIONS.map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => handleChange('ambientSound', opt.id)}
                     className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                       preferences.ambientSound === opt.id
                         ? 'bg-teal-600/30 border-teal-500 text-white shadow-sm'
                         : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                     }`}
                   >
                     <span className="text-xl">{opt.icon}</span>
                     <span className="text-[10px] font-medium">{opt.label}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Coach Voice</label>
            <div className="grid grid-cols-1 gap-2">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleChange('voiceName', voice.id)}
                  className={`px-4 py-3 rounded-lg border text-left transition-all flex items-center justify-between group ${
                    preferences.voiceName === voice.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{voice.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border ${
                        voice.style === 'Calm' ? 'bg-teal-500/10 text-teal-300 border-teal-500/30' :
                        voice.style === 'Deep' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                        'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {voice.style}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 block mt-1">{voice.description}</span>
                  </div>
                  {preferences.voiceName === voice.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Night Journal Prompt Selection */}
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">Night Journal Focus</label>
             <div className="grid grid-cols-2 gap-2">
                {JOURNAL_PROMPT_OPTIONS.map((option) => (
                   <button
                     key={option.id}
                     onClick={() => handleChange('journalPromptStyle', option.id)}
                     className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-center ${
                       preferences.journalPromptStyle === option.id
                         ? 'bg-purple-900/40 border-purple-500 text-white shadow-sm'
                         : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                     }`}
                   >
                     <span className="text-xs font-semibold uppercase tracking-wider mb-1">{option.label}</span>
                     <span className="text-[10px] opacity-70 leading-tight">{option.description}</span>
                   </button>
                ))}
             </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-slate-900 font-semibold rounded-full hover:bg-indigo-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
