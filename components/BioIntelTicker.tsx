import React, { useState, useEffect } from 'react';
import { getDailyFact, BioIntelFact } from '../constants/bioIntelFacts';

interface BioIntelTickerProps {
  onLearnMore?: () => void; // Opens Science Modal
}

const BioIntelTicker: React.FC<BioIntelTickerProps> = ({ onLearnMore }) => {
  const [fact, setFact] = useState<BioIntelFact | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load daily fact
    const dailyFact = getDailyFact();
    setFact(dailyFact);

    // Check if user has dismissed today's fact
    const dismissedDate = localStorage.getItem('bioIntelDismissedDate');
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem('bioIntelDismissedDate', today);
    setIsVisible(false);
  };

  if (!fact || !isVisible) return null;

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physiology': return '🧬';
      case 'technique': return '💡';
      case 'neuroscience': return '⚡';
      case 'performance': return '📈';
      default: return '💎';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-30 animate-fade-in">
      <div 
        className={`bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-96' : 'w-80'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(fact.category)}</span>
            <div>
              <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Bio-Intel</h4>
              <p className="text-[10px] text-slate-500">Today's Insight</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Dismiss (returns tomorrow)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fact Content */}
        <div className="p-4">
          <p className="text-sm text-slate-200 leading-relaxed">{fact.fact}</p>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-800/50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fact.category}
          </button>
          
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
            >
              Learn More
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BioIntelTicker;
