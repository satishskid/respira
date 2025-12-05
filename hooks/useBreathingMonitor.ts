
import { useState, useEffect, useRef } from 'react';

interface BreathingMonitorResult {
  isBreathing: boolean;
  breathState: 'inhale/exhale' | 'rest';
  consistencyScore: number; // 0 to 100
}

export const useBreathingMonitor = (volume: number, isActive: boolean): BreathingMonitorResult => {
  const [breathState, setBreathState] = useState<'inhale/exhale' | 'rest'>('rest');
  const [consistencyScore, setConsistencyScore] = useState(100);

  // Constants
  const THRESHOLD_HIGH = 0.08; // Volume to trigger "Active"
  const THRESHOLD_LOW = 0.04;  // Volume to drop to "Rest"
  
  // Refs for tracking state without re-renders
  const lastStateChangeRef = useRef<number>(Date.now());
  const durationsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setBreathState('rest');
      return;
    }

    // Schmitt Trigger Logic for stability
    if (breathState === 'rest' && volume > THRESHOLD_HIGH) {
      const now = Date.now();
      const duration = now - lastStateChangeRef.current;
      
      // Record duration of the previous "rest" period
      if (duration < 10000) { // Ignore huge gaps
         durationsRef.current.push(duration);
         if (durationsRef.current.length > 5) durationsRef.current.shift();
      }

      setBreathState('inhale/exhale');
      lastStateChangeRef.current = now;
    } 
    else if (breathState === 'inhale/exhale' && volume < THRESHOLD_LOW) {
      const now = Date.now();
      const duration = now - lastStateChangeRef.current;
      
      // Record duration of the active breath
      if (duration < 10000) {
        durationsRef.current.push(duration);
        if (durationsRef.current.length > 5) durationsRef.current.shift();
      }

      setBreathState('rest');
      lastStateChangeRef.current = now;
    }

    // Calculate Consistency (Variance of durations)
    // Lower variance = Higher consistency
    if (durationsRef.current.length > 2) {
       const mean = durationsRef.current.reduce((a, b) => a + b, 0) / durationsRef.current.length;
       const variance = durationsRef.current.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / durationsRef.current.length;
       // Map variance to 0-100 score (approximate)
       // Variance of 0 = 100 score. Variance of 1,000,000 (1s deviation squared) = lower score
       const score = Math.max(0, 100 - (Math.sqrt(variance) / 50));
       setConsistencyScore(Math.round(score));
    }

  }, [volume, isActive, breathState]);

  return {
    isBreathing: breathState === 'inhale/exhale',
    breathState,
    consistencyScore
  };
};
