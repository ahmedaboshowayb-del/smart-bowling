'use client';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ReferenceLine,
} from 'recharts';
import type { Language, AnalyticsFrame } from '@/types/bowling';
import { calculateAngularVelocity } from '@/lib/physics';
import type { BallPhysics } from '@/types/bowling';

interface DashboardProps {
  lang: Language;
  physics: BallPhysics;
  frames: AnalyticsFrame[];
  result: { pinsKnocked: number; strikeProbability: number; impactForce: number; energyTransfer: number } | null;
}

/* Custom Tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs font-mono border border-neon-blue/20">
      <div className="text-white/40 mb-1">{`t=${label}s`}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/60">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* Metric Card */
function MetricCard({ label, labelAr, value, unit, color, icon, change, isRTL }: {
  label: string; labelAr: string;
  value: string | number; unit: string;
  color: string; icon: string;
  change?: string; isRTL: boolean;
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        {change && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
            change.startsWith('+') ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-black font-mono tabular-nums" style={{ color, textShadow: `0 0 12px ${color}50` }}>
        {value}
        <span className="text-sm font-medium opacity-50 ml-1">{unit}</span>
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
        {isRTL ? labelAr : label}
      </div>
    </div>
  );
}

/* Radar Chart of performance */
function PerformanceRadar({ physics, isRTL }: { physics: BallPhysics; isRTL: boolean }) {
  const data = [
    { metric: isRTL ? 'السرعة' : 'Speed', value: Math.round((physics.speed / 35) * 100) },
    { metric: isRTL ? 'الدوران' : 'Spin', value: Math.round((physics.spinRate / 600) * 100) },
    { metric: isRTL ? 'الدقة' : 'Accuracy', value: Math.round((1 - Math.abs(physics.angle) / 10) * 100) },
    { metric: isRTL ? 'القوة' : 'Power', value: Math.round((physics.weight / 7.2) * 100) },
    { metric: isRTL ? 'السيطرة' : 'Control', value: Math.round(physics.friction * 100) },
  ];

  return (
    <div className="stat-card" style={{ height: '288px' }}>
      <div className="text-[11px] text-white/50 uppercase tracking-wider mb-2">
        {isRTL ? 'تحليل الأداء الراداري' : 'Performance Radar'}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(0,212,255,0.08)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
          />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          <Radar
            dataKey="value"
            stroke="#00D4FF"
            fill="#00D4FF"
            fillOpacity={0.15}
            dot={{ fill: '#00D4FF', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard({ lang, physics, frames, result }: DashboardProps) {
  const isRTL = lang === 'ar';
  const angularVel = calculateAngularVelocity(physics.spinRate);

  // Generate mock historical data if no real frames
  const chartData = frames.length > 0 ? frames.map(f => ({
    time: f.time.toFixed(1),
    speed: f.speed,
    rpm: f.rpm / 10, // scale for chart
    energy: f.energy,
  })) : Array.from({ length: 20 }, (_, i) => ({
    time: (i * 0.25).toFixed(1),
    speed: Math.max(0, 22 - i * 0.8 + (Math.random() - 0.5) * 0.5),
    rpm: Math.max(0, 32 - i * 1.2 + (Math.random() - 0.5) * 1),
    energy: Math.max(0, 15 - i * 0.6 + (Math.random() - 0.5) * 0.3),
  }));

  const metrics = [
    {
      label: 'Ball Velocity', labelAr: 'سرعة الكرة',
      value: physics.speed.toFixed(1), unit: 'km/h', color: '#00D4FF', icon: '🚀',
      change: '+2.3',
    },
    {
      label: 'Angular Velocity', labelAr: 'السرعة الزاوية',
      value: angularVel.toFixed(1), unit: 'rad/s', color: '#8B00FF', icon: '🌀',
    },
    {
      label: 'Impact Force', labelAr: 'قوة التأثير',
      value: result?.impactForce.toFixed(1) ?? '—', unit: 'N', color: '#FF3366', icon: '💥',
    },
    {
      label: 'Energy Transfer', labelAr: 'نقل الطاقة',
      value: result?.energyTransfer.toFixed(1) ?? '—', unit: 'J', color: '#FFB800', icon: '⚡',
    },
    {
      label: 'Strike Probability', labelAr: 'احتمالية الضربة',
      value: result?.strikeProbability.toFixed(0) ?? Math.round((physics.speed / 35) * 85).toString(),
      unit: '%', color: '#00FF88', icon: '🎯',
    },
    {
      label: 'Pins Knocked', labelAr: 'الأقماع المُسقطة',
      value: result?.pinsKnocked ?? '—', unit: '/ 10', color: '#00D4FF', icon: '🎳',
    },
  ];

  return (
    <section id="dashboard" dir={isRTL ? 'rtl' : 'ltr'} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-bg-primary dot-grid" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">
            📊 {isRTL ? 'لوحة التحليل الهندسي' : 'Engineering Analysis Dashboard'}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black text-white">
            {isRTL ? 'التحليل' : 'Real-Time'}{' '}
            <span className="gradient-text">{isRTL ? 'الهندسي' : 'Analysis'}</span>
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {metrics.map((m, i) => (
            <MetricCard key={i} {...m} isRTL={isRTL} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Speed & Energy Area Chart */}
          <div className="lg:col-span-2 stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] text-white/50 uppercase tracking-wider">
                {isRTL ? 'تطور السرعة والطاقة عبر الزمن' : 'Speed & Energy Over Time'}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 rounded" style={{ background: '#00D4FF' }} />
                  <span className="text-white/40">{isRTL ? 'السرعة' : 'Speed'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 rounded" style={{ background: '#FFB800' }} />
                  <span className="text-white/40">{isRTL ? 'الطاقة' : 'Energy'}</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="speed" name={isRTL ? 'السرعة' : 'Speed'}
                  stroke="#00D4FF" fill="url(#speedGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="energy" name={isRTL ? 'الطاقة' : 'Energy'}
                  stroke="#FFB800" fill="url(#energyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Radar */}
          <PerformanceRadar physics={physics} isRTL={isRTL} />
        </div>

        {/* Pin Collision Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pin Formation Heatmap */}
          <div className="stat-card">
            <div className="text-[11px] text-white/50 uppercase tracking-wider mb-4">
              {isRTL ? 'خريطة تصادم الأقماع' : 'Pin Collision Heatmap'}
            </div>
            <div className="flex gap-6 items-center justify-center h-48">
              {/* Pin formation SVG */}
              <svg viewBox="0 0 200 180" className="w-48 h-44">
                {/* Lane */}
                <rect x="40" y="0" width="120" height="180" fill="rgba(58,34,17,0.4)" rx="4" />
                {/* Gutters */}
                <rect x="20" y="0" width="20" height="180" fill="rgba(0,0,0,0.3)" />
                <rect x="160" y="0" width="20" height="180" fill="rgba(0,0,0,0.3)" />

                {/* Pins */}
                {[
                  [66, 30], [100, 30], [134, 30], // would be 4 in full
                  [83, 60], [100, 60], [117, 60],
                  [100, 90], [117, 90],
                  [100, 120],
                ].map(([x, y], i) => {
                  const knocked = result && result.pinsKnocked > i;
                  const intensity = knocked ? 0.9 : 0.2;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={12}
                        fill={knocked ? '#FF3366' : '#1A2A1A'}
                        stroke={knocked ? '#FF3366' : '#00FF88'}
                        strokeWidth={1.5}
                        opacity={intensity}
                      />
                      <circle cx={x} cy={y} r={6}
                        fill={knocked ? '#FF336660' : '#00FF8830'}
                      />
                      <text x={x} y={y + 4} textAnchor="middle"
                        fontSize={8} fill="white" opacity={0.8}
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Ball trajectory */}
                {result && (
                  <path
                    d={`M${100 + physics.angle * 3},170 Q${100 + physics.angle},90 100,20`}
                    fill="none" stroke="#00D4FF" strokeWidth={2}
                    strokeDasharray="5 3" opacity={0.7}
                  />
                )}

                {/* Labels */}
                <text x="100" y="175" textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)">
                  {isRTL ? 'منطقة الأقماع' : 'Pin Deck'}
                </text>
              </svg>

              {/* Legend */}
              <div className="flex flex-col gap-2 text-[10px] font-mono">
                {[
                  { color: '#00FF88', label: isRTL ? 'واقف' : 'Standing' },
                  { color: '#FF3366', label: isRTL ? 'مُسقط' : 'Knocked' },
                  { color: '#00D4FF', label: isRTL ? 'المسار' : 'Trajectory' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="text-white/50">{label}</span>
                  </div>
                ))}
                <div className="mt-3 text-white/30 text-[9px]">
                  {result
                    ? `${result.pinsKnocked}/10 ${isRTL ? 'مُسقط' : 'knocked'}`
                    : isRTL ? 'لا توجد بيانات' : 'No data yet'}
                </div>
              </div>
            </div>
          </div>

          {/* Physics Summary */}
          <div className="stat-card">
            <div className="text-[11px] text-white/50 uppercase tracking-wider mb-4">
              {isRTL ? 'ملخص المعاملات الفيزيائية' : 'Physics Parameters Summary'}
            </div>
            <div className="space-y-3">
              {[
                {
                  label: isRTL ? 'الزخم الزاوي L = I × ω' : 'Angular Momentum L = I × ω',
                  value: `${(0.4 * physics.weight * 0.22 ** 2 * angularVel).toFixed(2)} kg·m²/s`,
                  color: '#8B00FF',
                },
                {
                  label: isRTL ? 'الطاقة الحركية KE = ½mv²' : 'Kinetic Energy KE = ½mv²',
                  value: `${(0.5 * physics.weight * (physics.speed / 3.6) ** 2).toFixed(1)} J`,
                  color: '#FFB800',
                },
                {
                  label: isRTL ? 'زخم الكرة p = mv' : 'Linear Momentum p = mv',
                  value: `${(physics.weight * (physics.speed / 3.6)).toFixed(2)} kg·m/s`,
                  color: '#00D4FF',
                },
                {
                  label: isRTL ? 'قوة الاحتكاك f = μN' : 'Friction Force f = μN',
                  value: `${(physics.friction * physics.weight * 9.81).toFixed(1)} N`,
                  color: '#FF3366',
                },
                {
                  label: isRTL ? 'وقت العبور t = d/v' : 'Transit Time t = d/v',
                  value: `${(18.29 / (physics.speed / 3.6)).toFixed(2)} s`,
                  color: '#00FF88',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="text-[10px] text-white/40 font-mono leading-tight">{label}</div>
                  <div className="text-sm font-black font-mono shrink-0" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
