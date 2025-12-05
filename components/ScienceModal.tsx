import React, { useState } from 'react';
import { NEURO_MECHANICS, SCIENCE_PROTOCOLS, SCIENCE_CITATIONS, DATA_PRIVACY_INFO } from '../constants/scienceData';

interface ScienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'neuro' | 'protocols' | 'citations' | 'privacy';

const ScienceModal: React.FC<ScienceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('neuro');
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleProtocol = (id: string) => {
    setExpandedProtocol(expandedProtocol === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-3xl">🧬</span> System Architecture & Efficacy
          </h2>
          <p className="text-sm text-slate-400">Scientific foundation of RESPIRA's bio-rhythm intelligence</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => setActiveTab('neuro')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'neuro'
                ? 'text-white bg-slate-700 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Neuro-Mechanics
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'protocols'
                ? 'text-white bg-slate-700 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Protocol Index
          </button>
          <button
            onClick={() => setActiveTab('citations')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'citations'
                ? 'text-white bg-slate-700 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Research
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'text-white bg-slate-700 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Neuro-Mechanics Tab */}
          {activeTab === 'neuro' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">{NEURO_MECHANICS.title}</h3>
              {NEURO_MECHANICS.sections.map((section, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h4 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-blue-400">→</span> {section.concept}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{section.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Protocol Index Tab */}
          {activeTab === 'protocols' && (
            <div className="space-y-4">
              {SCIENCE_PROTOCOLS.map((protocol) => (
                <div key={protocol.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleProtocol(protocol.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-md font-bold text-white">{protocol.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{protocol.pattern}</p>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedProtocol === protocol.id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedProtocol === protocol.id && (
                    <div className="p-4 pt-0 space-y-4 border-t border-slate-700">
                      <div>
                        <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Origin</p>
                        <p className="text-sm text-slate-300">{protocol.origin}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Mechanism</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{protocol.mechanism}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-slate-500 font-semibold mb-2">Benefits</p>
                        <ul className="space-y-1">
                          {protocol.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-green-400 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span> {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {protocol.contraindications && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <p className="text-xs uppercase text-red-400 font-semibold mb-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Contraindications
                          </p>
                          <ul className="space-y-1">
                            {protocol.contraindications.map((contra, idx) => (
                              <li key={idx} className="text-xs text-red-300 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">⚠</span> {contra}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Citations Tab */}
          {activeTab === 'citations' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                RESPIRA's protocols are grounded in peer-reviewed neuroscience and clinical research.
              </p>
              {SCIENCE_CITATIONS.map((citation, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-sm font-medium text-white mb-1">
                    {citation.authors} ({citation.year})
                  </p>
                  <p className="text-sm text-slate-300 italic mb-2">{citation.title}</p>
                  {citation.journal && (
                    <p className="text-xs text-slate-500">{citation.journal}</p>
                  )}
                  {citation.url && (
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                    >
                      Read Paper
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">{DATA_PRIVACY_INFO.title}</h3>
              {DATA_PRIVACY_INFO.sections.map((section, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h4 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-green-400">🔒</span> {section.heading}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScienceModal;
