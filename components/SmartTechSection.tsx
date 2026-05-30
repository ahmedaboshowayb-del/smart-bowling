'use client';
import { useState } from 'react';
import type { Language } from '@/types/bowling';
import { TECH_CARDS } from '@/lib/constants';

interface SmartTechProps { lang: Language; }

function TechCard3D({ card, isRTL, isActive, onClick }: {
  card: typeof TECH_CARDS[0];
  isRTL: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left w-full transition-all duration-500 cursor-pointer rounded-2xl p-6 border overflow-hidden ${
        isActive
          ? 'border-neon-blue/50 shadow-neon bg-neon-blue/5'
          : 'border-white/8 hover:border-white/20 glass-hover glass'
      }`}
      style={isActive ? { boxShadow: `0 0 40px ${card.color}25, 0 20px 60px rgba(0,0,0,0.7)` } : {}}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${card.color}12 0%, transparent 70%)`,
        }}
      />
      {isActive && (
        <div
          className="absolute inset-0 animate-[glowPulse_3s_ease-in-out_infinite_alternate]"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${card.color}08 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
          opacity: isActive ? 1 : 0.3,
        }}
      />

      {/* Icon */}
      <div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `${card.color}18`,
          border: `1px solid ${card.color}35`,
          boxShadow: isActive ? `0 0 20px ${card.color}30` : 'none',
        }}
      >
        {card.icon}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white mb-2 group-hover:text-white transition-colors">
        {isRTL ? card.titleAr : card.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-white/45 leading-relaxed line-clamp-3">
        {isRTL ? card.descriptionAr : card.description}
      </p>

      {/* Specs Preview */}
      {isActive && (
        <div className="mt-4 grid grid-cols-2 gap-1.5 animate-[fadeIn_0.4s_ease-out]">
          {card.specs.map(spec => (
            <div
              key={spec}
              className="text-[10px] font-mono px-2 py-1 rounded-lg"
              style={{
                background: `${card.color}12`,
                color: card.color,
                border: `1px solid ${card.color}25`,
              }}
            >
              ✓ {spec}
            </div>
          ))}
        </div>
      )}

      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute bottom-3 right-3 w-2 h-2 rounded-full animate-ping"
          style={{ background: card.color }}
        />
      )}
    </button>
  );
}

/* Animated 3D visualization of the selected tech */
function TechVisualizer({ card, isRTL }: { card: typeof TECH_CARDS[0]; isRTL: boolean }) {
  return (
    <div
      className="relative h-80 rounded-2xl overflow-hidden border"
      style={{ borderColor: `${card.color}30`, background: 'rgba(5,5,15,0.9)' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${card.color}08 1px, transparent 1px),
            linear-gradient(90deg, ${card.color}08 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Central SVG visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        {card.id === 'imu' && <IMUVisualization color={card.color} />}
        {card.id === 'motion' && <MotionVisualization color={card.color} />}
        {card.id === 'vision' && <VisionVisualization color={card.color} />}
        {card.id === 'laser' && <LaserVisualization color={card.color} />}
        {card.id === 'ai' && <AIVisualization color={card.color} />}
      </div>

      {/* Specs overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-[10px] font-mono text-white/40 mb-2 uppercase tracking-wider">
          {isRTL ? 'المواصفات التقنية' : 'Technical Specifications'}
        </div>
        <div className="flex flex-wrap gap-2">
          {card.specs.map(spec => (
            <span
              key={spec}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: `${card.color}20`, color: card.color, border: `1px solid ${card.color}30` }}
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
      />
    </div>
  );
}

function IMUVisualization({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 160" className="w-64 h-52">
      {/* Axes */}
      <line x1="100" y1="80" x2="150" y2="50" stroke={color} strokeWidth="2" opacity="0.8" />
      <line x1="100" y1="80" x2="50" y2="50" stroke="#FF3366" strokeWidth="2" opacity="0.8" />
      <line x1="100" y1="80" x2="100" y2="20" stroke="#00FF88" strokeWidth="2" opacity="0.8" />
      <text x="155" y="50" fill={color} fontSize="10">X</text>
      <text x="38" y="50" fill="#FF3366" fontSize="10">Y</text>
      <text x="103" y="18" fill="#00FF88" fontSize="10">Z</text>

      {/* IMU chip */}
      <rect x="78" y="60" width="44" height="38" rx="4" fill="#0D0D1A" stroke={color} strokeWidth="1.5" />
      <rect x="84" y="66" width="32" height="26" rx="2" fill={`${color}20`} />
      <text x="100" y="82" textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace">IMU</text>
      <text x="100" y="92" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">6-DOF</text>

      {/* Waveforms */}
      <polyline points="20,120 35,110 50,130 65,105 80,125 95,108 110,128 125,107 140,122 155,112 170,125 185,108"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
      <polyline points="20,140 35,133 50,145 65,130 80,142 95,132 110,146 125,131 140,140 155,135 170,142 185,133"
        fill="none" stroke="#00FF88" strokeWidth="1.5" opacity="0.7" />
      <text x="100" y="158" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">Sensor Data Stream</text>
    </svg>
  );
}

function MotionVisualization({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 160" className="w-64 h-52">
      {/* Ball path */}
      <path d="M20,140 Q60,100 100,80 Q140,60 180,30" fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />
      {/* Ball */}
      <circle cx="100" cy="80" r="12" fill="#0A0A14" stroke={color} strokeWidth="2" />
      <circle cx="96" cy="76" r="3" fill={color} opacity="0.9" />
      <circle cx="104" cy="75" r="3" fill={color} opacity="0.9" />
      <circle cx="100" cy="83" r="3" fill={color} opacity="0.9" />

      {/* Camera tripods */}
      {[[30, 20], [170, 20], [30, 130], [170, 130]].map(([cx, cy], i) => (
        <g key={i}>
          <rect x={cx - 8} y={cy - 6} width="16" height="12" rx="2" fill="#0D0D1A" stroke={color} strokeWidth="1" opacity="0.8" />
          <line x1={cx} y1={cy + 6} x2={cx} y2={cy + 16} stroke={color} strokeWidth="1" opacity="0.5" />
          <line x1={cx - 6} y1={cy + 16} x2={cx + 6} y2={cy + 16} stroke={color} strokeWidth="1" opacity="0.5" />
          <line x1={cx} y1={cy + 4} x2={100} y2={80} stroke={color} strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3" />
        </g>
      ))}
      <text x="100" y="155" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">Multi-Camera 3D Tracking</text>
    </svg>
  );
}

function VisionVisualization({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 160" className="w-64 h-52">
      {/* Camera frame */}
      <rect x="30" y="20" width="140" height="100" rx="6" fill="#0A0A14" stroke={color} strokeWidth="1.5" opacity="0.9" />
      {/* Lens circle */}
      <circle cx="100" cy="70" r="35" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="100" cy="70" r="25" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="70" r="5" fill={color} opacity="0.9" />

      {/* Detection boxes */}
      <rect x="65" y="50" width="70" height="50" rx="2" fill="none" stroke="#00FF88" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="65" y="46" fill="#00FF88" fontSize="8">Pin[0] conf:0.99</text>

      {/* Crosshairs */}
      <line x1="100" y1="35" x2="100" y2="105" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <line x1="65" y1="70" x2="135" y2="70" stroke={color} strokeWidth="0.5" opacity="0.3" />

      {/* FPS indicator */}
      <text x="38" y="115" fill={color} fontSize="8" fontFamily="monospace">60 FPS</text>
      <text x="140" y="115" fill="#00FF88" fontSize="8" fontFamily="monospace">LIVE</text>

      <text x="100" y="150" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">YOLOv8 Object Detection</text>
    </svg>
  );
}

function LaserVisualization({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 160" className="w-64 h-52">
      {/* Foul line */}
      <rect x="20" y="78" width="160" height="4" rx="1" fill="rgba(255,255,255,0.1)" />
      <text x="100" y="74" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">FOUL LINE</text>

      {/* Laser beams */}
      {[0, 1, 2, 3, 4].map(i => (
        <line
          key={i}
          x1={30 + i * 35} y1={80}
          x2={30 + i * 35} y2={80}
          stroke={color}
          strokeWidth="1"
          opacity="0.8"
        />
      ))}
      {[30, 65, 100, 135, 165].map((x, i) => (
        <g key={i}>
          {/* Emitter */}
          <rect x={x - 4} y="60" width="8" height="12" rx="1" fill="#0D0D1A" stroke={color} strokeWidth="1" />
          {/* Beam */}
          <line x1={x} y1="72" x2={x} y2="88" stroke={color} strokeWidth="1.5" opacity="0.9" />
          {/* Glow */}
          <ellipse cx={x} cy="80" rx="2" ry="8" fill={color} opacity="0.3" />
          {/* Receiver */}
          <rect x={x - 4} y="88" width="8" height="10" rx="1" fill="#0D0D1A" stroke={color} strokeWidth="1" />
        </g>
      ))}

      {/* Status */}
      <rect x="60" y="112" width="80" height="22" rx="4" fill="#0D0D1A" stroke={color} strokeWidth="1" />
      <text x="100" y="124" textAnchor="middle" fill="#00FF88" fontSize="9" fontFamily="monospace">GRID ACTIVE</text>
      <text x="100" y="133" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">0 violations</text>

      <text x="100" y="155" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">Laser Foul Detection Grid</text>
    </svg>
  );
}

function AIVisualization({ color }: { color: string }) {
  const nodes = [
    // Input layer
    [20, 40], [20, 70], [20, 100], [20, 130],
    // Hidden 1
    [80, 30], [80, 60], [80, 90], [80, 120], [80, 150],
    // Hidden 2
    [140, 50], [140, 85], [140, 120],
    // Output
    [180, 70], [180, 100],
  ];

  return (
    <svg viewBox="0 0 210 170" className="w-64 h-52">
      {/* Connections */}
      {nodes.slice(0, 4).map(([x1, y1]) =>
        nodes.slice(4, 9).map(([x2, y2], j) => (
          <line key={`${x1}-${x2}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="0.4" opacity="0.2" />
        ))
      )}
      {nodes.slice(4, 9).map(([x1, y1]) =>
        nodes.slice(9, 12).map(([x2, y2], j) => (
          <line key={`h1-${x1}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="0.4" opacity="0.3" />
        ))
      )}
      {nodes.slice(9, 12).map(([x1, y1]) =>
        nodes.slice(12).map(([x2, y2], j) => (
          <line key={`h2-${x1}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="0.8" opacity="0.5" />
        ))
      )}

      {/* Nodes */}
      {nodes.map(([x, y], i) => {
        const isInput = i < 4;
        const isOutput = i >= 12;
        const r = isInput || isOutput ? 6 : 5;
        return (
          <circle key={i} cx={x} cy={y} r={r}
            fill={isOutput ? color : `${color}30`}
            stroke={color}
            strokeWidth={isOutput ? 2 : 1}
            opacity={0.9}
          />
        );
      })}

      {/* Labels */}
      <text x="10" y="20" fill="rgba(255,255,255,0.3)" fontSize="7">Input</text>
      <text x="68" y="20" fill="rgba(255,255,255,0.3)" fontSize="7">Hidden</text>
      <text x="165" y="20" fill={color} fontSize="7">Output</text>
      <text x="172" y="80" fill={color} fontSize="7">Strike</text>
      <text x="172" y="110" fill={color} fontSize="7">Pins</text>

      <text x="105" y="165" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">LSTM Neural Network</text>
    </svg>
  );
}

export default function SmartTechSection({ lang }: SmartTechProps) {
  const isRTL = lang === 'ar';
  const [activeCard, setActiveCard] = useState(0);
  const selectedCard = TECH_CARDS[activeCard];

  return (
    <section id="technology" dir={isRTL ? 'rtl' : 'ltr'} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-bg-secondary" />
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Neon orbs */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl"
        style={{ background: `radial-gradient(circle, ${selectedCard.color}, transparent)` }} />
      <div className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full opacity-5 blur-3xl"
        style={{ background: `radial-gradient(circle, ${selectedCard.color}, transparent)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">
            🛰 {isRTL ? 'التقنيات الذكية' : 'Smart Technology'}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black text-white">
            {isRTL ? 'تقنيات' : 'Powered by'}{' '}
            <span className="gradient-text">{isRTL ? 'المستقبل' : 'Innovation'}</span>
          </h2>
          <p className="mt-3 text-white/40 max-w-lg mx-auto text-sm">
            {isRTL
              ? 'منظومة متكاملة من المستشعرات الذكية والذكاء الاصطناعي تُحلل كل جانب من جوانب رمية البولينج'
              : 'A complete ecosystem of smart sensors and AI that analyzes every aspect of your bowling technique'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TECH_CARDS.map((card, i) => (
              <TechCard3D
                key={card.id}
                card={card}
                isRTL={isRTL}
                isActive={activeCard === i}
                onClick={() => setActiveCard(i)}
              />
            ))}
          </div>

          {/* Detail Visualizer */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <TechVisualizer card={selectedCard} isRTL={isRTL} />

            {/* Selected card info */}
            <div className="hud-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${selectedCard.color}18`, border: `1px solid ${selectedCard.color}30` }}
                >
                  {selectedCard.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isRTL ? selectedCard.titleAr : selectedCard.title}
                  </div>
                  <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                    {isRTL ? 'تقنية متقدمة' : 'Advanced Technology'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                {isRTL ? selectedCard.descriptionAr : selectedCard.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
