
import React, { useEffect, useRef, useMemo } from 'react';

interface VisualizerProps {
  volume: number; // 0.0 to 1.0 (approx)
  isActive: boolean;
  breathingPattern?: string | null;
}

type PhaseType = 'inhale' | 'exhale' | 'hold';

interface BreathPhase {
  type: PhaseType;
  duration: number; // ms
  startScale: number; // 0.0 to 1.0 (relative to max radius)
  endScale: number;
  label: string;
  subLabel?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;     // 0.0 to 1.0
  decay: number;
  size: number;
  color: string;
}

const parsePattern = (pattern: string): BreathPhase[] => {
  if (!pattern) return [];

  const parts = pattern.split(/[,-]/); // Split by comma or hyphen
  const rawPhases: { type: PhaseType; duration: number }[] = [];

  // 1. Extract raw phases
  parts.forEach((part) => {
    const lower = part.toLowerCase().trim();
    let type: PhaseType | null = null;
    if (lower.includes('inhale')) type = 'inhale';
    else if (lower.includes('exhale')) type = 'exhale';
    else if (lower.includes('hold') || lower.includes('pause')) type = 'hold';

    if (type) {
      const match = lower.match(/(\d+(\.\d+)?)/); // Match integer or float
      // Default to 4s if no number found
      const duration = match ? parseFloat(match[0]) * 1000 : 4000; 
      rawPhases.push({ type, duration });
    }
  });

  if (rawPhases.length === 0) return [];

  // 2. Assign scales and generate labels
  const phases: BreathPhase[] = [];
  let currentScale = 0.3; // Start empty-ish

  rawPhases.forEach((p, i) => {
    let start = currentScale;
    let end = currentScale;
    
    // Determine Scale
    if (p.type === 'inhale') {
      end = 1.0; // Fill up
    } else if (p.type === 'exhale') {
      end = 0.3; // Empty down
    } 
    // Hold keeps start == end

    // Determine Label
    let label = p.type.toUpperCase();
    
    // Add context to HOLD labels (Full vs Empty) based on scale
    if (p.type === 'hold') {
        if (start > 0.6) label = 'HOLD (FULL)';
        else label = 'HOLD (EMPTY)';
    }

    // Determine SubLabel (Duration)
    let subLabel = '';
    if (p.duration > 0) {
        subLabel = `${p.duration / 1000}s`;
    }

    phases.push({
      type: p.type,
      duration: p.duration,
      startScale: start,
      endScale: end,
      label,
      subLabel
    });
    
    currentScale = end;
  });

  return phases;
};

// Smoother easing function: Ease In Out Cubic
const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive, breathingPattern }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // State for voice reactivity smoothing
  const smoothedVol = useRef(0);
  
  // State for breathing animation
  const startTimeRef = useRef<number | null>(null);
  const patternPhases = useMemo(() => parsePattern(breathingPattern || ''), [breathingPattern]);
  
  // Phase transition tracking
  const prevPhaseIndexRef = useRef<number>(-1);
  const transitionEffectRef = useRef<number>(0); // 1.0 (start) to 0.0 (end)

  // Particles
  const particlesRef = useRef<Particle[]>([]);

  // Reset timer when pattern changes
  useEffect(() => {
    startTimeRef.current = null;
    particlesRef.current = []; // Clear particles on new pattern
    prevPhaseIndexRef.current = -1;
    transitionEffectRef.current = 0;
  }, [breathingPattern]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (timestamp: number) => {
      // 1. Setup Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 2. Handle Voice Volume Smoothing
      const targetVol = isActive ? Math.max(0.05, volume * 1.5) : 0.02;
      smoothedVol.current += (targetVol - smoothedVol.current) * 0.1;

      // 3. Determine Mode
      if (patternPhases.length > 0 && isActive) {
        // --- BREATHING MODE ---
        if (startTimeRef.current === null) startTimeRef.current = timestamp;
        
        const totalCycleDuration = patternPhases.reduce((acc, p) => acc + p.duration, 0);
        const elapsed = (timestamp - startTimeRef.current) % totalCycleDuration;
        
        // Find current phase
        let accumulatedTime = 0;
        let currentPhase: BreathPhase = patternPhases[0];
        let phaseProgress = 0;
        let phaseIndex = 0;

        for (let i = 0; i < patternPhases.length; i++) {
          const p = patternPhases[i];
          if (elapsed < accumulatedTime + p.duration) {
            currentPhase = p;
            phaseProgress = (elapsed - accumulatedTime) / p.duration;
            phaseIndex = i;
            break;
          }
          accumulatedTime += p.duration;
        }

        // --- TRANSITION DETECTION ---
        if (phaseIndex !== prevPhaseIndexRef.current) {
          if (prevPhaseIndexRef.current !== -1) {
            transitionEffectRef.current = 1.0; // Trigger bloom/pulse
          }
          prevPhaseIndexRef.current = phaseIndex;
        }

        // Decay transition effect
        transitionEffectRef.current *= 0.94;

        // Calculate Radius based on Breath
        const easedProgress = easeInOutCubic(phaseProgress);
        const scaleRange = currentPhase.endScale - currentPhase.startScale;
        const currentScale = currentPhase.startScale + (scaleRange * easedProgress);
        
        // Base radius for breath circle
        const breathRadius = 40 + (currentScale * 110);

        // --- PARTICLE SYSTEM ---
        
        // Dynamic Spawn Rate: Active phases = frequent spawns, Hold = rare spawns
        let spawnChance = 0.3; 
        if (currentPhase.type === 'inhale' || currentPhase.type === 'exhale') {
            spawnChance = 0.5; // High activity
        } else {
            spawnChance = 0.1; // Low activity (Hold)
        }

        // Spawn particles
        if (Math.random() < spawnChance) {
           const angle = Math.random() * Math.PI * 2;
           // Spawn near edge of circle or random in space
           const r = breathRadius + (Math.random() * 40 - 20); 
           particlesRef.current.push({
             x: centerX + Math.cos(angle) * r,
             y: centerY + Math.sin(angle) * r,
             vx: (Math.random() - 0.5) * 0.5,
             vy: (Math.random() - 0.5) * 0.5,
             life: 1.0,
             decay: 0.005 + Math.random() * 0.01,
             size: 1 + Math.random() * 2,
             color: currentPhase.type === 'hold' ? '251, 191, 36' : '165, 180, 252' // Amber vs Indigo
           });
        }

        // Update & Draw Particles
        ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.life -= p.decay;
          
          // Move particles based on breath phase (Physics)
          if (currentPhase.type === 'inhale') {
             // Suction towards center (Active)
             const dx = centerX - p.x;
             const dy = centerY - p.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             // Accelerate inward
             if (dist > 10) {
                const force = 0.05;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
             }
             
             // Slight Swirl
             p.vx += -dy * 0.001;
             p.vy += dx * 0.001;

          } else if (currentPhase.type === 'exhale') {
             // Push outward (Active)
             const dx = p.x - centerX;
             const dy = p.y - centerY;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             // Accelerate outward
             if (dist > 1) {
                const force = 0.05;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
             }

          } else if (currentPhase.type === 'hold') {
             // Orbit / Hover for Hold (Calm)
             const angle = Math.atan2(p.y - centerY, p.x - centerX);
             const dist = Math.sqrt((p.x - centerX)**2 + (p.y - centerY)**2);
             // Very gentle orbit
             const orbitalSpeed = 0.01;
             const newAngle = angle + orbitalSpeed;
             p.x = centerX + Math.cos(newAngle) * dist;
             p.y = centerY + Math.sin(newAngle) * dist;
             
             // Significant dampening to represent stillness
             p.vx *= 0.85;
             p.vy *= 0.85;
          }

          // Apply velocity if not fully controlled by hold orbit
          if (currentPhase.type !== 'hold') {
              p.x += p.vx;
              p.y += p.vy;
              // Minimal dampening for active phases
              p.vx *= 0.98; 
              p.vy *= 0.98;
          }

          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          
          // Calmer look for hold (lower opacity)
          const opacityMult = currentPhase.type === 'hold' ? 0.3 : 0.7;
          ctx.fillStyle = `rgba(${p.color}, ${p.life * opacityMult})`;
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over'; // Reset blending

        // --- DRAW PULSE / SHOCKWAVE EFFECT ---
        if (transitionEffectRef.current > 0.01) {
           const pulseRadius = breathRadius + (50 * (1 - transitionEffectRef.current));
           ctx.beginPath();
           ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
           ctx.strokeStyle = `rgba(255, 255, 255, ${transitionEffectRef.current * 0.5})`;
           ctx.lineWidth = 2 + (transitionEffectRef.current * 3);
           ctx.stroke();
        }

        // --- DRAW BREATH CIRCLE ---
        
        // Color Selection
        let mainColor = '99, 102, 241'; // Indigo-500
        let secondaryColor = '129, 140, 248'; // Indigo-400
        
        if (currentPhase.type === 'hold') {
             // Amber/Orange for distinct "Pause/Retain" look
             mainColor = '245, 158, 11'; // Amber-500
             secondaryColor = '251, 191, 36'; // Amber-400
        }

        // Outer Glow (Voice Reactivity + Bloom Effect)
        // Add Bloom intensity from transition
        const bloomAdd = transitionEffectRef.current * 40;
        const glowRadius = breathRadius + (smoothedVol.current * 80) + bloomAdd;
        
        const glowGradient = ctx.createRadialGradient(centerX, centerY, breathRadius, centerX, centerY, glowRadius + 20);
        
        const glowOpacity = 0.5 + (transitionEffectRef.current * 0.3);
        glowGradient.addColorStop(0, `rgba(${secondaryColor}, ${glowOpacity})`);
        glowGradient.addColorStop(1, `rgba(${secondaryColor}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius + 20, 0, Math.PI * 2);
        ctx.fill();

        // Main Orb (Multiple layers for organic look)
        // Layer 1: Semi-transparent halo
        ctx.fillStyle = `rgba(${mainColor}, 0.2)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, breathRadius + 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 2: Core
        const coreGradient = ctx.createRadialGradient(centerX, centerY, breathRadius * 0.2, centerX, centerY, breathRadius);
        coreGradient.addColorStop(0, `rgba(${secondaryColor}, 0.9)`);
        coreGradient.addColorStop(0.8, `rgba(${mainColor}, 0.85)`);
        coreGradient.addColorStop(1, `rgba(${mainColor}, 0.6)`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, breathRadius, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3: Inner Rim Highlight
        ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, breathRadius * 0.95, 0, Math.PI * 2);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;

        // Draw Main Label
        ctx.font = '600 18px "Outfit", sans-serif';
        ctx.fillText(currentPhase.label, centerX, centerY - (currentPhase.subLabel ? 10 : 0));
        
        // Draw Sub Label (Duration)
        if (currentPhase.subLabel) {
            ctx.font = '400 14px "Outfit", sans-serif'; 
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(currentPhase.subLabel, centerX, centerY + 14);
        }

        ctx.shadowBlur = 0; // Reset

      } else {
        // --- STANDARD LISTENING/IDLE MODE ---
        const time = timestamp * 0.002;
        
        // Idle particles
        if (Math.random() > 0.8) {
           const angle = Math.random() * Math.PI * 2;
           const r = 50 + Math.random() * 50; 
           particlesRef.current.push({
             x: centerX + Math.cos(angle) * r,
             y: centerY + Math.sin(angle) * r,
             vx: (Math.random() - 0.5) * 0.2,
             vy: (Math.random() - 0.5) * 0.2,
             life: 1.0,
             decay: 0.01,
             size: 1 + Math.random(),
             color: '129, 140, 248'
           });
        }
        
        // Draw Idle Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.life -= p.decay;
            p.x += p.vx;
            p.y += p.vy;
            if (p.life <= 0) {
               particlesRef.current.splice(i, 1);
               continue;
            }
            ctx.fillStyle = `rgba(${p.color}, ${p.life * 0.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Idle Blob
        const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 150);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.6)'); 
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
        gradient.addColorStop(1, 'rgba(67, 56, 202, 0)');
        ctx.fillStyle = gradient;

        const maxRadius = 80 + (smoothedVol.current * 120);
        const baseRadius = 60 + (Math.sin(time) * 5); 
        const radius = isActive ? maxRadius : baseRadius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(165, 180, 252, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [volume, isActive, patternPhases]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={400} 
      className="w-full max-w-[400px] h-auto pointer-events-none"
    />
  );
};

export default Visualizer;
