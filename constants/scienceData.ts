// Science & Methodology Content for ScienceModal.tsx
// Contains Neuro-Mechanics, Protocol Index, and Citations

export interface ScienceProtocol {
  id: string;
  name: string;
  pattern: string;
  origin: string;
  mechanism: string;
  benefits: string[];
  contraindications?: string[];
}

export interface ScienceCitation {
  authors: string;
  year: number;
  title: string;
  journal?: string;
  url?: string;
}

// Section A: Neuro-Mechanics
export const NEURO_MECHANICS = {
  title: "The Neuro-Circuitry",
  sections: [
    {
      concept: "The Vagal Brake",
      description: "Your heart rate is modulated by breathing. Inhaling suppresses the Vagus nerve (Heart Rate Up). Exhaling activates it (Heart Rate Down). RESPIRA uses ratio-based breathing (e.g., 1:2) to mechanically force the nervous system into a parasympathetic (rest) state."
    },
    {
      concept: "CO₂ Tolerance & Stress Resilience",
      description: "Most people over-breathe, creating chronic CO₂ deficiency. This triggers the sympathetic nervous system (fight/flight). Building CO₂ tolerance through controlled breathing recalibrates your stress threshold, reducing anxiety and improving mental clarity."
    },
    {
      concept: "Heart Rate Variability (HRV)",
      description: "HRV measures the variation in time between heartbeats. Higher HRV = better stress adaptation. Coherent breathing at 5.5-6 breaths per minute maximizes HRV by synchronizing heart rhythm with respiratory sinus arrhythmia (RSA)."
    }
  ]
};

// Section B: Protocol Index
export const SCIENCE_PROTOCOLS: ScienceProtocol[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing (4-4-4-4)',
    pattern: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s',
    origin: 'Tactical & Clinical usage (Navy SEALs, Mark Divine)',
    mechanism: 'Hyper-regulation of CO₂. Stabilizes the amygdala (fear center) during high-stress inputs. The equal-ratio pattern creates predictable neural oscillation, reducing threat perception.',
    benefits: [
      'Rapid stress reduction',
      'Enhanced focus under pressure',
      'Lowered cortisol levels',
      'Improved decision-making in chaos'
    ],
    contraindications: ['Severe hypertension (breath holding may spike BP)', 'Pregnancy (prolonged holds not recommended)']
  },
  {
    id: 'cyclic-sighing',
    name: 'Cyclic Sighing (Physiological Sigh)',
    pattern: 'Double Inhale (short, short) → Extended Exhale',
    origin: 'Dr. Andrew Huberman / Stanford Neurobiology Lab',
    mechanism: 'Maximum alveolar recruitment to dump CO₂. The double inhale re-inflates collapsed air sacs in lungs, while the extended exhale activates the vagus nerve. The fastest protocol for acute stress reduction.',
    benefits: [
      'Fastest calming response (30 seconds)',
      'Reduces arousal immediately',
      'Natural "reset button" for panic',
      'Improves oxygenation efficiency'
    ]
  },
  {
    id: '4-7-8-sleep',
    name: '4-7-8 Sleep Protocol',
    pattern: 'Inhale 4s → Hold 7s → Exhale 8s',
    origin: 'Dr. Andrew Weil (Integrative Medicine)',
    mechanism: 'Rhythmic sedation. The 7-second hold increases intra-thoracic pressure, while the 8-second exhale optimizes gas exchange for sleep onset. Activates parasympathetic dominance through prolonged exhalation.',
    benefits: [
      'Accelerates sleep onset',
      'Natural tranquilizer effect',
      'Reduces racing thoughts',
      'Lowers heart rate pre-sleep'
    ],
    contraindications: ['Active COPD (prolonged holds may cause distress)', 'Severe anxiety (may trigger hyperventilation in beginners)']
  },
  {
    id: 'coherent-breathing',
    name: 'Coherent Breathing (5.5 BPM)',
    pattern: 'Inhale 5.5s → Exhale 5.5s',
    origin: 'Dr. Richard Gevirtz & Heart Math Institute',
    mechanism: 'Synchronizes breathing with natural heart rhythm oscillation (Respiratory Sinus Arrhythmia). At ~6 breaths per minute, parasympathetic tone peaks, creating maximum HRV and autonomic balance.',
    benefits: [
      'Optimizes Heart Rate Variability',
      'Balances sympathetic/parasympathetic',
      'Sustained calm without sedation',
      'Used in clinical PTSD treatment'
    ]
  },
  {
    id: 'wim-hof-method',
    name: 'Wim Hof Method (Controlled Hyperventilation)',
    pattern: '30-40 Deep Breaths → Full Exhale Hold → Recovery Breath + Hold',
    origin: 'Wim Hof ("The Iceman")',
    mechanism: 'Intentional hypocapnia (low CO₂) followed by hypoxia (low O₂). Triggers adrenaline release, alkalizes blood pH, and activates immune response. The retention phase trains CO₂ tolerance.',
    benefits: [
      'Boosts energy and alertness',
      'Enhances immune function',
      'Increases cold tolerance',
      'Improves mental resilience'
    ],
    contraindications: [
      'Pregnancy (alkalosis risk)',
      'Epilepsy (hyperventilation may trigger seizures)',
      'Severe hypertension',
      'NEVER practice in water or while driving'
    ]
  }
];

// Section C: Citations & Research
export const SCIENCE_CITATIONS: ScienceCitation[] = [
  {
    authors: 'Balban, M. Y., Neri, E., Kogon, M. M., et al.',
    year: 2023,
    title: 'Brief structured respiration practices enhance mood and reduce physiological arousal',
    journal: 'Cell Reports Medicine',
    url: 'https://www.cell.com/cell-reports-medicine/fulltext/S2666-3791(22)00474-8'
  },
  {
    authors: 'Nestor, J.',
    year: 2020,
    title: 'Breath: The New Science of a Lost Art',
    journal: 'Riverhead Books'
  },
  {
    authors: 'Lehrer, P. M., & Gevirtz, R.',
    year: 2014,
    title: 'Heart rate variability biofeedback: how and why does it work?',
    journal: 'Frontiers in Psychology',
    url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2014.00756/full'
  },
  {
    authors: 'Gerritsen, R. J., & Band, G. P.',
    year: 2018,
    title: 'Breath of Life: The Respiratory Vagal Stimulation Model of Contemplative Activity',
    journal: 'Frontiers in Human Neuroscience',
    url: 'https://www.frontiersin.org/articles/10.3389/fnhum.2018.00397/full'
  },
  {
    authors: 'Kox, M., van Eijk, L. T., Zwaag, J., et al.',
    year: 2014,
    title: 'Voluntary activation of the sympathetic nervous system and attenuation of the innate immune response in humans',
    journal: 'Proceedings of the National Academy of Sciences',
    url: 'https://www.pnas.org/content/111/20/7379'
  },
  {
    authors: 'Ma, X., Yue, Z. Q., Gong, Z. Q., et al.',
    year: 2017,
    title: 'The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress in Healthy Adults',
    journal: 'Frontiers in Psychology',
    url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2017.00874/full'
  }
];

// Privacy & Data Architecture
export const DATA_PRIVACY_INFO = {
  title: "Zero-Knowledge Architecture",
  sections: [
    {
      heading: "Client-Side Only",
      content: "RESPIRA runs entirely in your browser. No breathing data, audio, or personal information is ever transmitted to our servers. Your sessions exist only on your device."
    },
    {
      heading: "Direct API Connection",
      content: "When you provide your Gemini API key, it connects directly from your browser to Google's servers. We never see, store, or proxy your key. It's stored locally in your browser's IndexedDB."
    },
    {
      heading: "No Analytics Tracking",
      content: "We don't use Google Analytics, Facebook Pixel, or any third-party tracking scripts. Your usage patterns remain private."
    },
    {
      heading: "Data Portability",
      content: "All your session logs and journal entries are stored in IndexedDB. You can export or delete them at any time from Settings."
    }
  ]
};
