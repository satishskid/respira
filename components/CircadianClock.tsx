import { useState } from 'react';

interface Protocol {
  id: string;
  name: string;
  icon: string;
  time: string;
  timeRange: { start: number; end: number };
  angle: number;
  color: string;
  description: string;
  goal: string;
}

const protocols: Protocol[] = [
  {
    id: 'morning',
    name: 'Sunrise',
    icon: '🌅',
    time: '07:00',
    timeRange: { start: 7, end: 8 },
    angle: 90, // 7AM position
    color: '#f43f5e',
    description: 'Energizing breathwork to kickstart your day',
    goal: 'Activation & Intention',
  },
  {
    id: 'focus',
    name: 'Focus',
    icon: '🎯',
    time: '10:00',
    timeRange: { start: 10, end: 12 },
    angle: 135, // 10AM position
    color: '#6366f1',
    description: 'Symmetric patterns for sustained concentration',
    goal: 'Clarity & Flow',
  },
  {
    id: 'walk',
    name: 'Kinetic Sync',
    icon: '🏔️',
    time: '18:00',
    timeRange: { start: 18, end: 19 },
    angle: 270, // 6PM position
    color: '#2dd4bf',
    description: 'Walking meditation synced to your cadence',
    goal: 'Reset & Grounding',
  },
  {
    id: 'night',
    name: 'Moonlight',
    icon: '🌑',
    time: '22:00',
    timeRange: { start: 22, end: 22.5 },
    angle: 330, // 10PM position
    color: '#8b5cf6',
    description: 'Voice journaling to release the day',
    goal: 'Unload & Reflect',
  },
  {
    id: 'sleep',
    name: 'Delta Wave',
    icon: '🌌',
    time: '23:00',
    timeRange: { start: 23, end: 23.5 },
    angle: 345, // 11PM position
    color: '#4c1d95',
    description: '4-7-8 breathing for deep rest',
    goal: 'Sleep Onset',
  },
];

interface CircadianClockProps {
  onProtocolSelect?: (protocolId: string) => void;
  currentProtocol?: string;
}

export default function CircadianClock({ onProtocolSelect, currentProtocol }: CircadianClockProps) {
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null);
  const [currentTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours + minutes / 60;
  });

  // Calculate current time angle (0 = 12AM at top, rotates clockwise)
  const currentAngle = ((currentTime / 24) * 360 - 90) % 360;

  // Find currently active protocol based on time
  const activeProtocol = protocols.find(
    (p) => currentTime >= p.timeRange.start && currentTime < p.timeRange.end
  );

  const handleProtocolClick = (protocol: Protocol) => {
    if (onProtocolSelect) {
      onProtocolSelect(protocol.id);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Clock Container */}
      <div className="relative aspect-square w-full">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          {/* Outer circle */}
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="url(#gradient-outer)"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Inner circle */}
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke="url(#gradient-inner)"
            strokeWidth="1"
            opacity="0.2"
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
              <stop offset="25%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="gradient-inner" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Time markers (12, 3, 6, 9) */}
          {[0, 90, 180, 270].map((angle, idx) => {
            const radian = ((angle - 90) * Math.PI) / 180;
            const x = 200 + Math.cos(radian) * 165;
            const y = 200 + Math.sin(radian) * 165;
            const timeLabel = ['12', '6', '12', '6'][idx];
            const meridiem = idx < 2 ? 'AM' : 'PM';

            return (
              <g key={angle}>
                <circle cx={x} cy={y} r="2" fill="#64748b" opacity="0.5" />
                <text
                  x={x}
                  y={y + (idx === 0 ? -10 : idx === 2 ? 15 : 5)}
                  textAnchor="middle"
                  className="text-xs fill-slate-400 font-mono"
                >
                  {timeLabel}{meridiem}
                </text>
              </g>
            );
          })}

          {/* Current time indicator */}
          <g transform={`rotate(${currentAngle} 200 200)`}>
            <line
              x1="200"
              y1="200"
              x2="200"
              y2="70"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
            <circle cx="200" cy="70" r="4" fill="#60a5fa" />
          </g>

          {/* Center dot */}
          <circle cx="200" cy="200" r="6" fill="#1e293b" stroke="#6366f1" strokeWidth="2" />
        </svg>

        {/* Protocol Nodes */}
        {protocols.map((protocol) => {
          const radian = ((protocol.angle - 90) * Math.PI) / 180;
          const x = 200 + Math.cos(radian) * 180;
          const y = 200 + Math.sin(radian) * 180;
          const isHovered = hoveredProtocol === protocol.id;
          const isActive = activeProtocol?.id === protocol.id;
          const isSelected = currentProtocol === protocol.id;

          return (
            <div
              key={protocol.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
              style={{
                left: `${(x / 400) * 100}%`,
                top: `${(y / 400) * 100}%`,
                zIndex: isHovered ? 20 : isActive || isSelected ? 15 : 10,
              }}
              onMouseEnter={() => setHoveredProtocol(protocol.id)}
              onMouseLeave={() => setHoveredProtocol(null)}
              onClick={() => handleProtocolClick(protocol)}
            >
              {/* Node Circle */}
              <div
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                  isHovered
                    ? 'w-20 h-20 shadow-2xl'
                    : isActive || isSelected
                    ? 'w-16 h-16 shadow-xl'
                    : 'w-12 h-12 shadow-lg'
                }`}
                style={{
                  backgroundColor: protocol.color,
                  boxShadow: isHovered || isActive || isSelected
                    ? `0 0 30px ${protocol.color}80`
                    : `0 0 15px ${protocol.color}40`,
                }}
              >
                <span className={`${isHovered ? 'text-3xl' : 'text-2xl'} transition-all duration-300`}>
                  {protocol.icon}
                </span>

                {/* Active indicator ring */}
                {(isActive || isSelected) && (
                  <div className="absolute inset-0 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>

              {/* Hover/Active Info Card */}
              {(isHovered || isActive || isSelected) && (
                <div
                  className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 w-48 p-3 bg-slate-900/95 backdrop-blur-md rounded-lg border shadow-2xl animate-fadeIn"
                  style={{ borderColor: protocol.color }}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-xl">{protocol.icon}</span>
                      <h4 className="font-bold text-white text-sm">{protocol.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{protocol.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-mono">{protocol.time}</span>
                      <span className="text-indigo-300 font-medium">{protocol.goal}</span>
                    </div>
                  </div>
                  {/* Arrow pointing up */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: `6px solid ${protocol.color}`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-4">
          Your circadian rhythm drives 5 optimal windows for breath training
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {protocols.map((protocol) => (
            <button
              key={protocol.id}
              onClick={() => handleProtocolClick(protocol)}
              onMouseEnter={() => setHoveredProtocol(protocol.id)}
              onMouseLeave={() => setHoveredProtocol(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentProtocol === protocol.id
                  ? 'text-white scale-105 shadow-lg'
                  : 'text-gray-400 hover:text-white hover:scale-105'
              }`}
              style={{
                backgroundColor: currentProtocol === protocol.id ? protocol.color : `${protocol.color}20`,
                borderWidth: '1px',
                borderColor: protocol.color,
              }}
            >
              {protocol.icon} {protocol.name}
            </button>
          ))}
        </div>

        {activeProtocol && (
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/30">
            <p className="text-sm text-white">
              <span className="text-indigo-300 font-semibold">Currently optimal:</span>{' '}
              {activeProtocol.name} {activeProtocol.icon}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
