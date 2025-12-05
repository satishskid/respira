
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export type RoutineMode = 'morning' | 'focus' | 'walk' | 'night' | 'sleep';

export type JournalPromptStyle = 'standard' | 'gratitude' | 'release' | 'learning' | 'sleep_induction';

export type AmbientSound = 'off' | 'rain' | 'ocean' | 'forest';

export type BreathingRatio = '1:1' | '1:1.5' | '1:2' | '2:1';

export type HealthCondition = 'pregnancy' | 'hypertension' | 'epilepsy' | 'none';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface UserPreferences {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  focus: 'calm' | 'energy' | 'sleep' | 'balance';
  environment: 'nature-walk' | 'seated-meditation';
  voiceName: string;
  journalPromptStyle: JournalPromptStyle;
  ambientSound: AmbientSound;
  breathingRatio: BreathingRatio;
  healthConditions: HealthCondition[];
  hasOnboarded: boolean;
  geminiApiKey: string | null; // BYOK: User's personal Gemini API key
}

export interface AudioVisualizerData {
  volume: number;
}

export interface SessionLog {
  id?: number;
  timestamp: number; // Date.now()
  durationSeconds: number;
  focus: string;
  techniqueUsed?: string; // e.g. "Box Breathing"
}

export interface JournalEntry {
  id?: number;
  timestamp: number;
  text: string;
  tags: string[]; // e.g., ["gratitude", "night"]
}

// PWA Install Event Type
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}