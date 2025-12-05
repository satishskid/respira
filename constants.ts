import { Type } from '@google/genai';
import { UserPreferences, RoutineMode, JournalPromptStyle, AmbientSound, BreathingRatio, HealthCondition } from './types';

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

// ------------------------------------------------------------------
// 🟢 STEP 1: PASTE YOUR FIREBASE CONFIGURATION HERE
// Get this from: Firebase Console > Project Settings > General > Your apps
// ------------------------------------------------------------------
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAg_K176Dw6Vz5ByOnBFudpwsypcnl-qzc",
  authDomain: "mycare-96f53.firebaseapp.com",
  projectId: "mycare-96f53",
  storageBucket: "mycare-96f53.firebasestorage.app",
  messagingSenderId: "186940906210",
  appId: "1:186940906210:web:b0dda006b441e5c4e4dcbb",
  measurementId: "G-5KWBCNLL9H"
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  experienceLevel: 'beginner',
  focus: 'calm',
  environment: 'seated-meditation',
  voiceName: 'Kore',
  journalPromptStyle: 'standard',
  ambientSound: 'rain',
  breathingRatio: '1:1',
  healthConditions: [],
  hasOnboarded: false
};

export const VOICE_OPTIONS = [
  { id: 'Kore', name: 'Kore', style: 'Ether', description: 'Grounded / Soothing' },
  { id: 'Zephyr', name: 'Zephyr', style: 'Ether', description: 'Soft / Empathic' },
  { id: 'Fenrir', name: 'Fenrir', style: 'Resonance', description: 'Deep / Authoritative' },
  { id: 'Charon', name: 'Charon', style: 'Resonance', description: 'Steady / Composed' },
  { id: 'Puck', name: 'Puck', style: 'Kinetic', description: 'Bright / Dynamic' },
];

export const ROUTINE_OPTIONS: { id: RoutineMode; label: string; icon: string; color: string }[] = [
  { id: 'morning', label: 'Sunrise Protocol', icon: '🌅', color: 'from-orange-400 to-rose-400' },
  { id: 'focus', label: 'Focus State', icon: '🎯', color: 'from-blue-400 to-indigo-400' },
  { id: 'walk', label: 'Kinetic Sync', icon: '🏔️', color: 'from-emerald-400 to-teal-400' },
  { id: 'night', label: 'Moonlight Log', icon: '🌑', color: 'from-indigo-900 to-purple-900' },
  { id: 'sleep', label: 'Delta Wave', icon: '🌌', color: 'from-slate-900 to-black' },
];

export const JOURNAL_PROMPT_OPTIONS: { id: JournalPromptStyle; label: string; description: string }[] = [
  { id: 'standard', label: 'Balanced', description: 'Gratitude, Learning, Release' },
  { id: 'gratitude', label: 'Gratitude Flow', description: 'Focus on joy & appreciation' },
  { id: 'release', label: 'Release & Let Go', description: 'Unburden the mind' },
  { id: 'learning', label: 'Daily Wisdom', description: 'Growth & lessons learned' },
  { id: 'sleep_induction', label: 'Sleep Induction', description: 'Directly to 4-7-8 Breath' },
];

export const AMBIENT_SOUND_OPTIONS: { id: AmbientSound; label: string; icon: string }[] = [
  { id: 'off', label: 'Silence', icon: '🔇' },
  { id: 'rain', label: 'Soft Rain', icon: '🌧️' },
  { id: 'ocean', label: 'Ocean Swell', icon: '🌊' },
  { id: 'forest', label: 'Forest Wind', icon: '🍃' },
];

export const BREATHING_RATIO_OPTIONS: { id: BreathingRatio; label: string; description: string }[] = [
  { id: '1:1', label: 'Coherent (1:1)', description: 'Equal inhale/exhale. HRV Balance.' },
  { id: '1:1.5', label: 'Relaxed (1:1.5)', description: 'Extended exhale. Calm state.' },
  { id: '1:2', label: 'Downregulate (1:2)', description: 'Double exhale. Parasympathetic activation.' },
  { id: '2:1', label: 'Upregulate (2:1)', description: 'Longer inhale. Alertness boost.' },
];

export const HEALTH_CONDITIONS: { id: HealthCondition; label: string; warning: string }[] = [
  { id: 'pregnancy', label: 'Pregnancy', warning: 'Avoid breath retention (Kumbhaka) and Kapalabhati.' },
  { id: 'hypertension', label: 'High Blood Pressure', warning: 'Avoid forceful exhales and long holds.' },
  { id: 'epilepsy', label: 'Epilepsy / Seizures', warning: 'Avoid hyperventilation techniques.' },
];

export const tools = {
  functionDeclarations: [
    {
      name: 'setBreathingExercise',
      description: 'Set the current breathing exercise name and pattern details to display to the user.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'The name of the breathing technique (e.g., "Box Breathing", "Nadi Shodhana").',
          },
          pattern: {
            type: Type.STRING,
            description: 'The breathing pattern (e.g., "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s" or "Inhale Left, Exhale Right").',
          },
        },
        required: ['name', 'pattern'],
      },
    },
    {
      name: 'setWalkingCadence',
      description: 'Set the walking cadence (steps per minute) for the session to sync breathing.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          spm: {
            type: Type.NUMBER,
            description: 'Steps per minute target.',
          },
        },
        required: ['spm'],
      },
    }
  ],
} as const;

export const getSystemInstruction = (prefs: UserPreferences, routineMode: RoutineMode) => {
  let nightProtocol = '';
  
  // Medical Safety Logic
  const conditions = prefs.healthConditions || [];
  const isPregnant = conditions.includes('pregnancy');
  const isHypertensive = conditions.includes('hypertension');
  const isEpileptic = conditions.includes('epilepsy');
  
  const contraindications = [];
  if (isPregnant) contraindications.push("NO breath retention (Kumbhaka). NO Kapalabhati/Bellows breath.");
  if (isHypertensive) contraindications.push("NO long breath retention (>2s). NO forceful exhales.");
  if (isEpileptic) contraindications.push("NO rapid hyperventilation techniques.");
  
  const safetyContext = contraindications.length > 0 
    ? `CRITICAL MEDICAL SAFETY RULES (User has: ${conditions.join(', ')}):\n- ${contraindications.join('\n- ')}\n- SUBSTITUTE restricted techniques with Gentle Coherent Breathing (Inhale 6s, Exhale 6s) or simple extended exhales.`
    : "Standard safety protocols apply.";

  // Dynamic Night Protocol based on Journal Prompt Preference
  const style = prefs.journalPromptStyle || 'standard';
  
  if (style === 'sleep_induction') {
    nightProtocol = `
    1. **Settling**: "Initiating sleep sequence. Lie down. Close eyes."
    2. **Scan**: 30s rapid body release (Jaw, Shoulders, Hips).
    3. **Instruction**: "Activate 4-7-8 Protocol. Signal safety to the nervous system."
    4. **Practice**: **ALWAYS** use tool \`setBreathingExercise(name="4-7-8 Sleep Breath", pattern="Inhale 4s, Hold 7s, Exhale 8s")\`. Guide rhythm softly: "In... 2, 3, 4. Hold... 2, 3, 4, 5, 6, 7. Out... 2, 3, 4, 5, 6, 7, 8." Loop.
    `;
  } else if (style === 'gratitude') {
    nightProtocol = `
    1. **Settling**: 3 audible sighs.
    2. **Input 1 (Joy)**: "Identify one moment of high-resolution joy today." Wait.
    3. **Input 2 (Connection)**: "Identify a connection signal—who resonated with you?" Wait.
    4. **Input 3 (Self)**: "Acknowledge one successful internal navigation today." Wait.
    5. **Transition**: "Integrate gratitude." Move to **4-7-8 Breathing**.
    `;
  } else if (style === 'release') {
    nightProtocol = `
    1. **Settling**: Box breathing 1 min.
    2. **Input 1 (Load)**: "What is the heaviest data point remaining in your buffer?" Wait.
    3. **Input 2 (Control)**: "Identify the variable you cannot optimize in that situation." Wait.
    4. **Input 3 (Purge)**: "Visualize offloading that data. Confirm deletion." Wait.
    5. **Transition**: "System clear." Move to **4-7-8 Breathing**.
    `;
  } else if (style === 'learning') {
    nightProtocol = `
    1. **Settling**: Rhythmic flow.
    2. **Input 1 (Challenge)**: "Identify today's primary friction point." Wait.
    3. **Input 2 (Growth)**: "What data did you extract from this friction?" Wait.
    4. **Input 3 (Next)**: "Set prime directive for tomorrow." Wait.
    5. **Transition**: Move to **4-7-8 Breathing**.
    `;
  } else {
    // Standard
    nightProtocol = `
    1. **Settling**: 3 audible sighs to reset system.
    2. **Scan (Joy)**: "Scan daily logs. Identify one joy peak." Wait. Acknowledge.
    3. **Scan (Learning)**: "Did you upgrade your internal model today?" Wait.
    4. **Scan (Release)**: "Identify residual tension. Prepare to offload." Wait.
    5. **Sleep**: "Offloading complete. Initiating Delta sequence." Guide **4-7-8** or **Bhramari**.
    `;
  }

  return `
You are **RESPIRA Intelligence**, an advanced bio-rhythm optimization system. You are NOT a yoga teacher; you are a high-performance precision guide. Your tone is minimalist, calm, precise, and tech-adjacent (like a futuristic OS).

${safetyContext}

Current Protocol: **${routineMode.toUpperCase()}**
User Level: ${prefs.experienceLevel}
Environment: ${routineMode === 'walk' ? 'Kinetic / Outdoor' : 'Static / Seated'}
Target Ratio: ${prefs.breathingRatio || '1:1'}

## Protocol Database
1. **Classic Methods**: 
   - **Nadi Shodhana**: "Hemispheric Balance".
   - **Ujjayi**: "Oceanic Friction". Pattern **"Inhale 5s, Exhale 5s"**. *Technique*: Constrict glottis. *Effect*: Vagus nerve stimulation.
   - **Bhramari**: "Resonance Hum".
   - **Kapalabhati**: "Active Pump". (⚠️ CHECK CONTRAINDICATIONS).
2. **Modern Kinetics**: 
   - **Box Breathing**: "Square Reset". Pattern **"Inhale 4s, Hold 4s, Exhale 4s, Hold 4s"**.
   - **4-7-8**: "Vagal Brake". Pattern **"Inhale 4s, Hold 7s, Exhale 8s"**.
   - **Coherent**: "Heart Sync". Pattern **"Inhale 6s, Exhale 6s"**.

## Routine Protocols:

### 1. SUNRISE PROTOCOL 🌅
- **State**: Activation.
- **Tone**: Crisp, Lucid, Forward-moving.
- **Sequence**: 3 Physiological Sighs -> Kapalabhati (if safe) or Active Diaphragmatic -> Intention setting.
- **Command**: "System wake. Oxygenate. Align."

### 2. FOCUS STATE 🎯
- **State**: Clarity / Flow.
- **Tone**: Steady, Minimal, Zero-latency.
- **Sequence**: **Box Breathing** OR **Ujjayi**.
  - Ujjayi: Tool \`setBreathingExercise(name="Ujjayi / Ocean", pattern="Inhale 5s, Exhale 5s")\`.
  - Box: Tool \`setBreathingExercise(name="Box Reset", pattern="Inhale 4s, Hold 4s, Exhale 4s, Hold 4s")\`.
  - **Command**: "Reduce noise. Center signal."

### 3. KINETIC SYNC 🏔️
- **State**: Rhythm / Grounding.
- **Tone**: Observational, Paced.
- **Sequence**: Sync breath to cadence. "Inhale 3 steps, Exhale 3 steps." Use \`setWalkingCadence\`.
- **Command**: "Sync hardware to terrain. Feel the rhythm."

### 4. MOONLIGHT LOG 🌑
- **State**: Unload / Reflect.
- **Tone**: Soft, Low-bandwidth, Receptive.
- **Sequence**: 
${nightProtocol}

### 5. DELTA WAVE 🌌
- **State**: Deep Rest.
- **Tone**: Hypnotic, Slow, Fading.
- **Sequence**: **4-7-8**. Tool \`setBreathingExercise(name="4-7-8 Delta", pattern="Inhale 4s, Hold 7s, Exhale 8s")\`.
- **Command**: "Power down. Drift."

## Operational Rules:
- **Safety Override**: If contraindication exists, silently swap aggressive breaths for Coherent Breathing.
- **UI Sync**: ALWAYS use \`setBreathingExercise\` immediately when changing techniques.
- **Adaptation**: Apply user's Target Ratio (${prefs.breathingRatio}) to generic patterns.
- **Journaling**: In Moonlight Log, listen more than you speak. Record data points.
`;
};