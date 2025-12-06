import { useState } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<'philosophy' | 'science' | 'protocols' | 'privacy'>('philosophy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">RESPIRA</h2>
              <p className="text-sm text-indigo-300">Bio-Rhythm Intelligence. From Sunrise to Sleep.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {(['philosophy', 'protocols', 'science', 'privacy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
          {activeTab === 'philosophy' && <PhilosophyTab />}
          {activeTab === 'protocols' && <ProtocolsTab />}
          {activeTab === 'science' && <ScienceTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
        </div>
      </div>
    </div>
  );
}

function PhilosophyTab() {
  return (
    <div className="space-y-6 text-gray-200">
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">It's not meditation. It's calibration.</h3>
        <div className="space-y-4 text-base leading-relaxed">
          <p>
            Meditation asks you to clear your mind.
            <br />
            <strong className="text-indigo-300">RESPIRA asks you to change your physiology.</strong>
          </p>
          <p>
            By mechanically altering your breath patterns—like extending your exhalations—you engage the{' '}
            <span className="text-teal-300 font-semibold">Vagal Brake</span>, a neural switch that instantly
            downregulates your heart rate and stress response.
          </p>
          <p className="text-lg text-white font-medium">
            This isn't spiritual. It's mechanical.
            <br />
            Precision engineering for your autonomic nervous system.
          </p>
          <p>
            And unlike apps that give you pre-recorded tracks, RESPIRA adapts in real-time. Our AI coach listens
            to you, adjusts to your pace, and explains the science as you breathe.{' '}
            <strong className="text-indigo-300">It's like having a performance coach in your pocket.</strong>
          </p>
        </div>
      </section>

      <section className="pt-6 border-t border-indigo-500/20">
        <h3 className="text-xl font-bold text-white mb-4">What Makes RESPIRA Different</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '🎯', title: 'Real-Time AI Coaching', desc: 'Not pre-recorded. Adapts to your responses.' },
            { icon: '🌅', title: 'Circadian Sync', desc: 'Protocols timed to your biological clock.' },
            { icon: '🚶', title: 'Walk Integration', desc: 'Syncs breathing to your walking cadence.' },
            { icon: '🔬', title: 'Science Explained', desc: 'Understand the "why" behind every technique.' },
            { icon: '🔒', title: 'Zero-Knowledge Privacy', desc: 'All processing on your device. No tracking.' },
            { icon: '💡', title: 'Proactive Guidance', desc: 'RESPIRA initiates, motivates, and adapts.' },
          ].map((feature, idx) => (
            <div key={idx} className="p-4 bg-slate-800/30 rounded-lg border border-indigo-500/10">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h4 className="font-semibold text-white">{feature.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-indigo-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Your Nervous System is the Hardware. RESPIRA is the Coach.</h3>
        <p className="text-gray-300 leading-relaxed">
          Your breath controls your state. Most people don't know how to use it. RESPIRA does. From the moment you
          wake up to the moment you fall asleep, every protocol is designed to sync with your biology—not fight it.
        </p>
      </section>
    </div>
  );
}

function ProtocolsTab() {
  const protocols = [
    {
      time: '07:00–08:00',
      icon: '🌅',
      name: 'Sunrise Protocol',
      subtitle: 'The Awakening',
      goal: 'Activation, oxygenation, intention-setting',
      what: 'Energizing breathwork synced to morning light and movement.',
      science:
        'Rapid kinetic breathing (Kapalabhati or Physiological Sighs) sharpens your Cortisol Awakening Response (CAR)—the natural spike in cortisol that signals your brain: "Day has begun. Time to perform."',
      special: 'Morning Walk Integration: RESPIRA tracks your steps and syncs breathing to your walking cadence.',
      duration: '5–8 minutes',
      color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30',
    },
    {
      time: '10:00–12:00',
      icon: '🎯',
      name: 'Focus State',
      subtitle: 'The Deep Work Window',
      goal: 'Mental clarity, sustained attention, flow state',
      what: 'Symmetric breathing patterns for sustained concentration.',
      science:
        'Box Breathing (4-4-4-4) stabilizes CO₂ tolerance and reduces amygdala reactivity—the brain region responsible for distraction and anxiety. You\'re training your nervous system to stay in the signal, not the noise.',
      special: 'The AI counts with you: "Inhale... 2, 3, 4. Hold... 2, 3, 4. Beautiful. Stay with me."',
      duration: '5–10 minutes',
      color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
    },
    {
      time: '18:00–19:00',
      icon: '🏔️',
      name: 'Kinetic Sync',
      subtitle: 'The Reset',
      goal: 'Stress release, embodiment, cognitive offload',
      what: 'Walking meditation with breath-to-cadence entrainment.',
      science:
        'After a day of cognitive load, your brain needs optical flow (visual movement through space) and rhythmic grounding. This protocol offloads mental buffer by syncing breath to steps.',
      special: 'Adapts to your pace: "I notice you\'re walking faster. Let\'s try: Inhale 2 steps, exhale 3 steps."',
      duration: '10–15 minutes',
      color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
    },
    {
      time: '22:00–22:30',
      icon: '🌑',
      name: 'Moonlight Log',
      subtitle: 'The Unloading',
      goal: 'Emotional release, narrative closure, mental buffer dump',
      what: 'Voice journaling guided by reflective prompts.',
      science:
        'Sleep quality depends on cognitive closure—your brain needs to know the day is "complete." Speaking your thoughts aloud triggers the Default Mode Network (DMN), helping you process and release mental friction.',
      special: 'Sample prompt: "What\'s the heaviest thing you\'re still carrying from today?"',
      duration: '3–5 minutes',
      color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    },
    {
      time: '23:00–23:30',
      icon: '🌌',
      name: 'Delta Wave',
      subtitle: 'The Shutdown',
      goal: 'Sleep onset, deep REM preparation, nervous system shutdown',
      what: '4-7-8 breathing with hypnotic voice guidance.',
      science:
        'Extended exhalations (8 seconds) trigger the Parasympathetic Nervous System, lowering core body temperature and signaling melatonin onset. This is your body\'s natural sedative.',
      special: 'Guided gently: "Let it all go, slowly, like a wave pulling back from the shore. You\'re safe."',
      duration: '5–7 minutes',
      color: 'from-indigo-900/40 to-slate-900/40 border-indigo-700/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Aligned with the Sun. Designed for Your Biology.</h3>
        <p className="text-gray-400">
          Your cortisol and melatonin levels fluctuate in a precise 24-hour rhythm. RESPIRA syncs with your biological
          clock to maximize efficacy at every hour.
        </p>
      </div>

      <div className="space-y-6">
        {protocols.map((protocol, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl bg-gradient-to-br ${protocol.color} border backdrop-blur-sm`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{protocol.icon}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xl font-bold text-white">{protocol.name}</h4>
                    <p className="text-sm text-gray-400">{protocol.subtitle}</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-900/50 rounded-full text-xs font-mono text-indigo-300">
                    {protocol.time}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-300">What You'll Do:</span>
                    <p className="text-gray-300 mt-1">{protocol.what}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-teal-300">The Science:</span>
                    <p className="text-gray-300 mt-1">{protocol.science}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-rose-300">How RESPIRA Guides You:</span>
                    <p className="text-gray-300 mt-1 italic">{protocol.special}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-400">
                      <strong className="text-white">Goal:</strong> {protocol.goal}
                    </span>
                    <span className="text-indigo-300 font-mono text-xs">{protocol.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScienceTab() {
  const studies = [
    {
      metric: '18% Increase in Oxygen',
      result: 'Nasal breathing releases nitric oxide (NO), improving circulation',
      source: 'Stanford Study, 2023',
    },
    {
      metric: 'Instant Vagal Activation',
      result: 'Extended exhale ratios (1:2) stimulate the vagus nerve',
      source: 'Porges Polyvagal Theory',
    },
    {
      metric: 'Navy SEALs Protocol',
      result: 'Box Breathing used for high-stress regulation in combat',
      source: 'Mark Divine, Unbeatable Mind',
    },
    {
      metric: 'Mood Improvement',
      result: 'Cyclic Sighing reduces anxiety faster than meditation',
      source: 'Huberman Lab, 2022',
    },
    {
      metric: 'Sleep Onset Acceleration',
      result: '4-7-8 breathing lowers cortisol by 36% in 5 minutes',
      source: 'Dr. Andrew Weil',
    },
  ];

  return (
    <div className="space-y-6 text-gray-200">
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Backed by Neurobiology. Not Spirituality.</h3>
        <p className="text-gray-400 mb-6">
          Every protocol in RESPIRA is built on peer-reviewed research from Stanford's Huberman Lab, Polyvagal Theory,
          HRV research, and clinical breathwork studies.
        </p>

        <div className="space-y-4">
          {studies.map((study, idx) => (
            <div key={idx} className="p-4 bg-slate-800/30 rounded-lg border border-indigo-500/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-lg">{study.metric}</h4>
                  <p className="text-gray-300 mt-1">{study.result}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-900/30 rounded-full text-xs text-indigo-300 border border-indigo-500/20">
                  {study.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-indigo-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Research Foundations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
            <h4 className="font-semibold text-indigo-300 mb-2">Stanford's Huberman Lab</h4>
            <p className="text-gray-400">Neuroscience research on breathwork and state modulation</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-lg border border-teal-500/20">
            <h4 className="font-semibold text-teal-300 mb-2">Polyvagal Theory</h4>
            <p className="text-gray-400">Stephen Porges' work on the vagus nerve and safety signaling</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-lg border border-rose-500/20">
            <h4 className="font-semibold text-rose-300 mb-2">HeartMath Institute</h4>
            <p className="text-gray-400">Heart Rate Variability (HRV) and coherence research</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-500/20">
            <h4 className="font-semibold text-violet-300 mb-2">Clinical Breathwork</h4>
            <p className="text-gray-400">Wim Hof Method, James Nestor's research</p>
          </div>
        </div>
      </section>

      <div className="mt-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
        <p className="text-center text-indigo-200 font-medium">
          We don't guess. We engineer.
        </p>
      </div>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-6 text-gray-200">
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Private by Design. Zero-Knowledge Architecture.</h3>
        <p className="text-lg text-gray-300 mb-6">
          Your breath. Your data. Your control.
        </p>

        <div className="space-y-4">
          {[
            {
              icon: '📱',
              title: 'Client-Side Only',
              desc: 'All processing happens on your device. Nothing leaves your browser.',
            },
            {
              icon: '🔑',
              title: 'Bring Your Own Key (BYOK)',
              desc: 'You provide your Gemini API key. We never see it or store it in the cloud.',
            },
            {
              icon: '💾',
              title: 'Local Storage',
              desc: 'Session logs and journals live in your browser\'s IndexedDB—never uploaded to any server.',
            },
            {
              icon: '🚫',
              title: 'No Cloud, No Tracking',
              desc: 'We don\'t store your voice. We don\'t sell your data. We don\'t track your sessions.',
            },
            {
              icon: '🔍',
              title: 'Open Design',
              desc: 'Our privacy approach is transparent and documented. No hidden data collection.',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-indigo-500/10">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-indigo-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Why This Matters</h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          Your nervous system data is the most intimate data you have. It reveals your stress levels, emotional state,
          sleep quality, and mental patterns.
        </p>
        <p className="text-gray-300 leading-relaxed">
          In a world where every app sells your data, RESPIRA asks for nothing. No email. No account. No tracking
          pixels. Just you, your breath, and an AI coach that lives on your device.
        </p>
      </section>

      <div className="mt-6 p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-500/30">
        <p className="text-center text-white text-lg font-medium">
          This is what privacy-first design looks like.
        </p>
      </div>

      <section className="pt-6 border-t border-indigo-500/20">
        <h3 className="text-xl font-bold text-white mb-4">How to Get Your API Key</h3>
        <div className="prose prose-invert max-w-none text-sm">
          <ol className="space-y-2 text-gray-300">
            <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy your key (starts with "AIza...")</li>
            <li>Paste it in RESPIRA's settings</li>
          </ol>
          <p className="text-xs text-gray-500 mt-4">
            Cost: ~$0.01 per session. You only pay Google directly for API usage.
          </p>
        </div>
      </section>
    </div>
  );
}
