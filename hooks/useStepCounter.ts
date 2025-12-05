
import { useState, useEffect, useRef } from 'react';

interface StepCounterResult {
  steps: number;
  cadence: number; // Steps per minute
  isSupported: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
}

export const useStepCounter = (isActive: boolean): StepCounterResult => {
  const [steps, setSteps] = useState(0);
  const [cadence, setCadence] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const lastStepTimeRef = useRef<number>(0);
  const stepHistoryRef = useRef<number[]>([]); // Timestamps of last few steps
  const lastAccelRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    // Calculate magnitude vector
    const magnitude = Math.sqrt(x*x + y*y + z*z);
    
    // Simple Peak Detection
    // 1. Threshold: Gravity is ~9.8. Walking adds force. Look for peaks > 11-12.
    // 2. Timeout: Humans can't step faster than ~250ms typically.
    const THRESHOLD = 11.5; 
    const MIN_STEP_DELAY = 300; // ms

    if (magnitude > THRESHOLD && magnitude < lastAccelRef.current) {
        // We just passed a peak (current is lower than last)
        const now = Date.now();
        if (now - lastStepTimeRef.current > MIN_STEP_DELAY) {
            
            setSteps(prev => prev + 1);
            lastStepTimeRef.current = now;

            // Calculate Cadence
            stepHistoryRef.current.push(now);
            if (stepHistoryRef.current.length > 5) stepHistoryRef.current.shift();
            
            if (stepHistoryRef.current.length >= 2) {
                const duration = stepHistoryRef.current[stepHistoryRef.current.length - 1] - stepHistoryRef.current[0];
                const stepsInWindow = stepHistoryRef.current.length - 1;
                const spm = (stepsInWindow / duration) * 60000;
                setCadence(Math.round(spm));
            }
        }
    }

    lastAccelRef.current = magnitude;
  };

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setHasPermission(true);
        }
      } catch (e) {
        console.error('Permission request error', e);
      }
    } else {
      // Non-iOS devices usually don't need explicit permission if context is secure
      setHasPermission(true);
    }
  };

  useEffect(() => {
    if (isActive && hasPermission) {
      window.addEventListener('devicemotion', handleMotion);
    } else {
      window.removeEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isActive, hasPermission]);

  return {
    steps,
    cadence,
    isSupported,
    hasPermission,
    requestPermission
  };
};
