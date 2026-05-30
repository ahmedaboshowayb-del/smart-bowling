'use client';
import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import type { Language, AnalyticsFrame } from '@/types/bowling';

interface AnalyticsSectionProps {
  lang: Language;
  liveFrames: AnalyticsFrame[];
}

/* Hit distribution data */
const HIT_DISTRIBUTION = [
  { zone: 'Strike', count: 34, color: '#00FF88' },
  { zone: '9-Pin', count: 28, color: '#00D4FF' },
  { zone: '8-Pin', count: 20, color: '#FFB800' },
  { zone: '7-Pin', count: 12, color: '#8B00FF' },
  { zone: 'Gutter', count: 6, color: '#FF3366' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs font-mono border border-neon-blue/20">
      <div className="text-white/40 mb-1.5">{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.stroke }} />
          <span className="text-white/50">{entry.name}:</span>
          <span className="font-bold" style={{ color: entry.color || entry.stroke }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* Live speed meter */
function SpeedMeter({ speed, maxSpeed = 35, isRTL }: { speed: number; maxSpeed?: number; isRTL: boolean }) {
  const percentage = (speed / maxSpeed) * 100;
  const angle = -135 + (percentage / 100) * 270;

  return (
    <div className="stat-card flex flex-col items-center">
      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">
        {isRTL ? 'مقياس السرعة' : 'Speed Meter'}
      </div>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 144 144" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 104 A 56 56 0 1 1 124 104"
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 20 104 A 56 56 0 1 1 124 104"
            fill="none"
            stroke="url(#speedGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 282} 282`}
            style={{ filter: 'drop-shadow(0 0 8px #00D4FF)' }}
          />
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00FF88" />
              <stop offset="50%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#FF3366" />
            </linearGradient>
          </defs>
          {/* Tick marks */}
          {Array.from({ length: 7 }).map((_, i) => {
            const tickAngle = (-135 + i * 45) * (Math.PI / 180);
            const x1 = 72 + 50 * Math.cos(tickAngle);
            const y1 = 72 + 50 * Math.sin(tickAngle);
            const x2 = 72 + 58 * Math.cos(tickAngle);
            const y2 = 72 + 58 * Math.sin(tickAngle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />;
          })}
          {/* Needle */}
          <g transform={`rotate(${angle}, 72, 72)`}>
            <line x1="72" y1="72" x2="72" y2="26" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 4px #00D4FF)' }} />
            <circle cx="72" cy="72" r="5" fill="#00D4FF" style={{ filter: 'drop-shadow(0 0 8px #00D4FF)' }} />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <div className="text-center">
            <div className="text-2xl font-black font-mono text-neon-blue" style={{ textShadow: '0 0 10px #00D4FF' }}>
              {speed.toFixed(1)}
            </div>
            <div className="text-[9px] text-white/30 font-mono uppercase">km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* RPM Gauge */
function RPMGauge({ rpm, isRTL }: { rpm: number; isRTL: boolean }) {
  const zones = [
    { max: 150, color: '#00FF88', label: isRTL ? 'منخفض' : 'Low' },
    { max: 300, color: '#FFB800', label: isRTL ? 'متوسط' : 'Mid' },
    { max: 450, color: '#00D4FF', label: isRTL ? 'مثالي' : 'Optimal' },
    { max: 600, color: '#FF3366', label: isRTL ? 'عالي' : 'High' },
  ];
  const zone = zones.find(z => rpm <= z.max) ?? zones[zones.length - 1];
  const pct = Math.min(100, (rpm / 600) * 100);

  return (
    <div className="stat-card">
      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-4">
        {isRTL ? 'معدل الدوران' : 'Spin Rate'}
      </div>
      <div className="text-3xl font-black font-mono mb-1" style={{ color: zone.color }}>
        {Math.round(rpm)}
        <span className="text-sm font-medium opacity-50 ml-1">RPM</span>
      </div>
      <div
        className="text-[10px] font-semibold mb-3 px-2 py-0.5 rounded-full inline-block"
        style={{ color: zone.color, background: `${zone.color}18` }}
      >
        {zone.label}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #00FF88, ${zone.color})`,
            boxShadow: `0 0 8px ${zone.color}60`,
          }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/20 font-mono mt-1">
        <span>0</span><span>150</span><span>300</span><span>450</span><span>600</span>
      </div>
    </div>
  );
}

export default function AnalyticsSection({ lang, liveFrames }: AnalyticsSectionProps) {
  const isRTL = lang === 'ar';
  const [sessionHistory, setSessionHistory] = useState<{ throw: number; pins: number; speed: number }[]>([]);
  const [ticker, setTicker] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate live ticker
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTicker(t => t + 1);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Update session history on new frames
  useEffect(() => {
    if (liveFrames.length > 0) {
      const lastFrame = liveFrames[liveFrames.length - 1];
      setSessionHistory(prev => [
        ...prev.slice(-9),
        {
          throw: prev.length + 1,
          pins: Math.floor(Math.random() * 5) + 5,
          speed: lastFrame.speed,
        },
      ]);
    }
  }, [liveFrames.length]);

  // Live data for speed chart
  const currentSpeed = liveFrames.length > 0
    ? liveFrames[liveFrames.length - 1].speed
    : 22 + Math.sin(ticker * 0.1) * 2;
  const currentRPM = liveFrames.length > 0
    ? liveFrames[liveFrames.length - 1].rpm
    : 320 + Math.cos(ticker * 0.08) * 30;

  // Build live stream data
  const liveData = liveFrames.length > 0
    ? liveFrames.map(f => ({ t: f.time.toFixed(1), v: f.speed, r: f.rpm / 10 }))
    : Array.from({ length: 20 }, (_, i) => ({
        t: (i * 0.25).toFixed(1),
        v: 22 - i * 0.6 + Math.sin(i) * 0.5,
        r: (320 - i * 10 + Math.cos(i) * 5) / 10,
      }));

  return (
    <section id="analytics" dir={isRTL ? 'rtl' : 'ltr'} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-bg-primary" />
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
            {isRTL ? 'التحليلات الآنية' : 'Real-Time Analytics'}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black text-white">
            {isRTL ? 'بيانات' : 'Live'}{' '}
            <span className="gradient-text">{isRTL ? 'مباشرة' : 'Performance Data'}</span>
          </h2>
        </div>

        {/* Top Row: Gauges + Live Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <SpeedMeter speed={currentSpeed} isRTL={isRTL} />
          <RPMGauge rpm={currentRPM} isRTL={isRTL} />

          {/* Accuracy Gauge */}
          <div className="stat-card">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">
              {isRTL ? 'دقة الإطلاق' : 'Release Accuracy'}
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: isRTL ? 'الإطار' : 'Frame', value: `${(85 + Math.sin(ticker * 0.05) * 5).toFixed(0)}%`, color: '#00FF88' },
                { label: isRTL ? 'الجلسة' : 'Session', value: '87%', color: '#00D4FF' },
                { label: isRTL ? 'المتوسط' : 'Average', value: '83%', color: '#FFB800' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">{label}</span>
                  <span className="text-sm font-black font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
              <div className="mt-2 progress-bar">
                <div className="progress-fill" style={{ width: '87%', background: 'linear-gradient(90deg, #00FF88, #00D4FF)' }} />
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="stat-card text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">
              {isRTL ? 'مجموع الأداء' : 'Performance Score'}
            </div>
            <div className="text-5xl font-black font-mono gradient-text mb-1">
              {Math.round(186 + Math.sin(ticker * 0.03) * 5)}
            </div>
            <div className="text-[10px] text-white/30 font-mono">/ 300 {isRTL ? 'نقطة' : 'pts'}</div>
            <div className="mt-3 progress-bar">
              <div className="progress-fill" style={{ width: '62%' }} />
            </div>
            <div className="mt-2 text-[10px] text-neon-blue font-semibold">
              {isRTL ? 'تقدم بـ +12 من الجلسة السابقة' : '+12 from last session'}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Live Stream Chart */}
          <div className="lg:col-span-2 stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] text-white/50 uppercase tracking-wider">
                {isRTL ? 'البث المباشر للسرعة والدوران' : 'Live Speed & Spin Stream'}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                <span className="text-success">{isRTL ? 'بث مباشر' : 'LIVE'}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={liveData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="v" name={isRTL ? 'السرعة' : 'Speed (km/h)'}
                  stroke="#00D4FF" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="r" name={isRTL ? 'الدوران' : 'Spin (×10)'}
                  stroke="#8B00FF" strokeWidth={2} dot={false} strokeDasharray="4 2" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hit Distribution Pie */}
          <div className="stat-card">
            <div className="text-[11px] text-white/50 uppercase tracking-wider mb-4">
              {isRTL ? 'توزيع النتائج' : 'Hit Distribution'}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={HIT_DISTRIBUTION}
                  dataKey="count"
                  nameKey="zone"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={35}
                  strokeWidth={0}
                >
                  {HIT_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-2">
              {HIT_DISTRIBUTION.map(({ zone, count, color }) => (
                <div key={zone} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                    <span className="text-white/50">{zone}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color }}>{count}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] text-white/50 uppercase tracking-wider">
              {isRTL ? 'سجل الجلسة' : 'Session History'}
            </div>
            <div className="text-[10px] font-mono text-white/30">
              {sessionHistory.length} {isRTL ? 'رمية' : 'throws'}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={sessionHistory.length > 0 ? sessionHistory : [
                { throw: 1, pins: 10, speed: 22 },
                { throw: 2, pins: 8, speed: 20 },
                { throw: 3, pins: 9, speed: 23 },
                { throw: 4, pins: 10, speed: 21 },
                { throw: 5, pins: 7, speed: 19 },
                { throw: 6, pins: 10, speed: 24 },
              ]}
              margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey="throw" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
                tickFormatter={v => `#${v}`} />
              <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pins" name={isRTL ? 'الأقماع' : 'Pins'} radius={[4, 4, 0, 0]}>
                {(sessionHistory.length > 0 ? sessionHistory : Array(6).fill(null)).map((entry, i) => {
                  const pins = entry?.pins ?? 7 + i;
                  const c = pins === 10 ? '#00FF88' : pins >= 8 ? '#00D4FF' : pins >= 6 ? '#FFB800' : '#FF3366';
                  return <Cell key={i} fill={c} opacity={0.8} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
