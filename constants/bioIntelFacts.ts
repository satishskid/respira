// Bio-Intel Daily Facts - Displayed on the wallpaper/background
// Rotates daily to keep users engaged with scientific credibility

export interface BioIntelFact {
  id: number;
  fact: string;
  category: 'physiology' | 'technique' | 'neuroscience' | 'performance';
}

export const BIO_INTEL_FACTS: BioIntelFact[] = [
  {
    id: 1,
    fact: "Nasal breathing releases nitric oxide, a vasodilator that increases oxygen circulation by up to 18%.",
    category: 'physiology'
  },
  {
    id: 2,
    fact: "Extended exhalation stimulates the Vagus Nerve, releasing acetylcholine to lower heart rate instantly.",
    category: 'neuroscience'
  },
  {
    id: 3,
    fact: "Carbon Dioxide tolerance is a primary indicator of stress resilience and anxiety regulation.",
    category: 'physiology'
  },
  {
    id: 4,
    fact: "The 'Physiological Sigh' (double inhale) is the fastest way to offload CO2 and reset the nervous system.",
    category: 'technique'
  },
  {
    id: 5,
    fact: "4-7-8 breathing acts as a natural tranquilizer for the nervous system by modulating cortisol rhythm.",
    category: 'technique'
  },
  {
    id: 6,
    fact: "Heart Rate Variability (HRV) coherence peaks when breathing at a rate of 5.5 to 6 breaths per minute.",
    category: 'performance'
  },
  {
    id: 7,
    fact: "Mouth breathing during sleep triggers the sympathetic nervous system, reducing deep REM cycles.",
    category: 'physiology'
  },
  {
    id: 8,
    fact: "Visual focus creates mental focus. Panoramic vision (soft gaze) triggers the relaxation response.",
    category: 'neuroscience'
  }
];

/**
 * Get the daily Bio-Intel fact based on current date
 * Rotates through facts using day of year as index
 */
export const getDailyFact = (): BioIntelFact => {
  const dayOfYear = Math.floor(Date.now() / 86400000); // Days since epoch
  const index = dayOfYear % BIO_INTEL_FACTS.length;
  return BIO_INTEL_FACTS[index];
};

/**
 * Get a random fact (for testing or manual rotation)
 */
export const getRandomFact = (): BioIntelFact => {
  const randomIndex = Math.floor(Math.random() * BIO_INTEL_FACTS.length);
  return BIO_INTEL_FACTS[randomIndex];
};
