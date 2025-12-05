
import React, { useEffect, useState } from 'react';
import { SessionLog, JournalEntry } from '../types';
import { dbService } from '../services/db';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'journal'>('sessions');
  const [history, setHistory] = useState<SessionLog[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      dbService.getHistory().then(setHistory);
      dbService.getJournalEntries().then(setJournals);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(ts));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Your Journey</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'sessions' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sessions
          </button>
          <button 
             onClick={() => setActiveTab('journal')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'journal' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Voice Journal
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          
          {activeTab === 'sessions' && (
             history.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No sessions recorded yet.</p>
                </div>
              ) : (
                history.map((log) => (
                  <div key={log.id || log.timestamp} className="bg-slate-700/50 rounded-xl p-4 flex justify-between items-center border border-slate-600/50">
                    <div>
                       <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">{log.focus}</p>
                       <p className="text-white font-medium">{log.techniqueUsed || 'Guided Flow'}</p>
                       <p className="text-xs text-slate-400 mt-1">{formatDate(log.timestamp)}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">{formatDuration(log.durationSeconds)}</span>
                  </div>
                ))
              )
          )}

          {activeTab === 'journal' && (
             journals.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No journal entries yet.</p>
                  <p className="text-xs mt-2">Use the "Night Reflect" routine to start.</p>
                </div>
             ) : (
                journals.map((entry) => (
                  <div key={entry.id || entry.timestamp} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 space-y-2">
                    <div className="flex justify-between items-center">
                       <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Night Reflection</p>
                       <p className="text-xs text-slate-400">{formatDate(entry.timestamp)}</p>
                    </div>
                    <p className="text-sm text-slate-200 italic leading-relaxed">"{entry.text}"</p>
                    <div className="flex gap-2 mt-2">
                       {entry.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">#{tag}</span>
                       ))}
                    </div>
                  </div>
                ))
             )
          )}

        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
