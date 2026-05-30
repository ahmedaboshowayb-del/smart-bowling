'use client';
import { useState, useRef, useCallback } from 'react';
import type { BallPhysics, OilPattern, Language } from '@/types/bowling';
import { OIL_PATTERNS } from '@/lib/constants';

interface PhysicsPanelProps {
  physics: BallPhysics;
  onChange: (key: keyof BallPhysics, value: number | string) => void;
  strikeProbability: number;
  lang: Language;
}

/* ─── Slider config ─────────────────────────────────────────── */
const SLIDERS = [
  {
    key: 'speed' as keyof BallPhysics,
    label: 'Ball Speed', labelAr: 'سرعة الكرة',
    unit: 'km/h', min: 6, max: 38, step: 0.5,
    color: '#00D4FF',
    hint: 'Optimal 18–24 km/h', hintAr: 'مثالي 18–24 كم/ساعة',
    decimals: 1,
  },
  {
    key: 'angle' as keyof BallPhysics,
    label: 'Release Angle', labelAr: 'زاوية الإطلاق',
    unit: '°', min: -12, max: 12, step: 0.5,
    color: '#8B00FF',
    hint: 'Optimal 2–6°', hintAr: 'مثالي 2–6 درجات',
    decimals: 1,
  },
  {
    key: 'weight' as keyof BallPhysics,
    label: 'Ball Weight', labelAr: 'وزن الكرة',
    unit: 'kg', min: 2.7, max: 7.3, step: 0.1,
    color: '#FFB800',
    hint: 'Standard 4.5–6.8 kg', hintAr: 'قياسي 4.5–6.8 كغ',
    decimals: 1,
  },
  {
    key: 'spinRate' as keyof BallPhysics,
    label: 'Spin Rate', labelAr: 'معدل الدوران',
    unit: 'RPM', min: 0, max: 600, step: 5,
    color: '#00FF88',
    hint: 'Optimal 280–400 RPM', hintAr: 'مثالي 280–400 دورة/دقيقة',
    decimals: 0,
  },
  {
    key: 'friction' as keyof BallPhysics,
    label: 'Friction Coeff.', labelAr: 'معامل الاحتكاك',
    unit: 'μ', min: 0.05, max: 1.0, step: 0.01,
    color: '#FF3366',
    hint: 'Lane dependent', hintAr: 'يعتمد على المسار',
    decimals: 2,
  },
  {
    key: 'hookStrength' as keyof BallPhysics,
    label: 'Hook Strength', labelAr: 'قوة الانحناء',
    unit: '', min: 0, max: 1, step: 0.01,
    color: '#FF8C00',
    hint: 'Lateral curve force', hintAr: 'قوة الانحناء الجانبي',
    decimals: 2,
  },
  {
    key: 'launchPos' as keyof BallPhysics,
    label: 'Launch Position', labelAr: 'موضع الإطلاق',
    unit: '', min: -1, max: 1, step: 0.05,
    color: '#40E0D0',
    hint: '-1 = Left, 0 = Center, 1 = Right', hintAr: '-1 يسار، 0 وسط، 1 يمين',
    decimals: 2,
  },
];

function getPercent(value: number, min: number, max: number) {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/* ─── Strike probability gauge ─────────────────────────────── */
function StrikeGauge({ probability, isRTL }: { probability: number; isRTL: boolean }) {
  const color = probability > 70 ? '#00FF88' : probability > 40 ? '#FFB800' : '#FF3366';
  const C = 2 * Math.PI * 44;
  const offset = C - (probability / 100) * C;
  const label = probability > 70
    ? (isRTL ? 'ممتاز' : 'Excellent')
    : probability > 40
    ? (isRTL ? 'جيد' : 'Good')
    : (isRTL ? 'منخفض' : 'Low');

  return (
    <div className="stat-card text-center py-5">
      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-4">
        {isRTL ? 'احتمالية الضربة الكاملة' : 'Strike Probability'}
      </div>
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
          {/* Value ring */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 5px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono" style={{ color, textShadow: `0 0 10px ${color}70` }}>
            {Math.round(probability)}
          </span>
          <span className="text-[9px] text-white/35 font-mono">%</span>
        </div>
      </div>
      <div
        className="mt-3 text-[11px] font-semibold px-3 py-1 rounded-full inline-block"
        style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─── Individual slider row with number input ────────────────── */
function SliderRow({
  config, value, onChange, isRTL,
}: {
  config: typeof SLIDERS[0];
  value: number;
  onChange: (val: number) => void;
  isRTL: boolean;
}) {
  const [inputVal, setInputVal] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = getPercent(value, config.min, config.max);

  const commit = useCallback((raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      onChange(Math.max(config.min, Math.min(config.max, n)));
    }
    setEditing(false);
  }, [config.min, config.max, onChange]);

  const displayValue = config.decimals === 0
    ? Math.round(value).toString()
    : value.toFixed(config.decimals);

  return (
    <div className="stat-card py-3 px-4">
      {/* Label + value input */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-white/65 truncate">
            {isRTL ? config.labelAr : config.label}
          </div>
          <div className="text-[9px] text-white/25 truncate mt-0.5">
            {isRTL ? config.hintAr : config.hint}
          </div>
        </div>

        {/* Editable number input */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              defaultValue={displayValue}
              min={config.min}
              max={config.max}
              step={config.step}
              onBlur={e => commit(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commit(e.currentTarget.value);
                if (e.key === 'Escape') setEditing(false);
              }}
              autoFocus
              className="w-20 text-right text-sm font-mono font-bold rounded-lg px-2 py-1 outline-none"
              style={{
                background: `${config.color}20`,
                border: `1px solid ${config.color}60`,
                color: config.color,
              }}
            />
          ) : (
            <button
              onClick={() => { setEditing(true); }}
              title="Click to edit"
              className="font-black font-mono text-base tabular-nums px-2.5 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                color: config.color,
                background: `${config.color}18`,
                border: `1px solid ${config.color}30`,
                textShadow: `0 0 8px ${config.color}60`,
              }}
            >
              {displayValue}
            </button>
          )}
          {config.unit && (
            <span className="text-[10px] text-white/30 font-mono w-6">{config.unit}</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative mt-1">
        {/* Track fill visual */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
              boxShadow: `0 0 8px ${config.color}55`,
              transition: 'width 0.1s',
            }}
          />
        </div>
        {/* Actual range input (transparent, on top) */}
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          aria-label={config.label}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          style={{ height: '20px', top: '-8px' }}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-[9px] text-white/18 mt-1 font-mono">
        <span>{config.min}{config.unit}</span>
        <span>{config.max}{config.unit}</span>
      </div>
    </div>
  );
}

/* ─── Oil pattern selector ──────────────────────────────────── */
function OilPatternPicker({
  current, onChange, isRTL,
}: {
  current: OilPattern;
  onChange: (v: OilPattern) => void;
  isRTL: boolean;
}) {
  return (
    <div className="stat-card py-3 px-4">
      <div className="text-[11px] font-semibold text-white/65 mb-3">
        {isRTL ? 'نمط الزيت' : 'Oil Pattern'}
      </div>
      <div className="space-y-1.5">
        {OIL_PATTERNS.map(pat => {
          const active = current === pat.value;
          const diffColor = pat.difficulty > 70 ? '#FF3366' : pat.difficulty > 45 ? '#FFB800' : '#00FF88';
          return (
            <button
              key={pat.value}
              onClick={() => onChange(pat.value as OilPattern)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200 border ${
                active
                  ? 'border-neon-blue/50 bg-neon-blue/10'
                  : 'border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/4'
              }`}
            >
              <span className={`text-xs font-semibold ${active ? 'text-neon-blue' : 'text-white/60'}`}>
                {isRTL ? pat.labelAr : pat.label}
              </span>
              <div className="flex items-center gap-2">
                {/* Difficulty pips */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-3 rounded-sm"
                      style={{
                        background: i < Math.round(pat.difficulty / 20)
                          ? diffColor : 'rgba(255,255,255,0.07)',
                        boxShadow: i < Math.round(pat.difficulty / 20)
                          ? `0 0 4px ${diffColor}` : 'none',
                      }}
                    />
                  ))}
                </div>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────── */
export default function PhysicsPanel({ physics, onChange, strikeProbability, lang }: PhysicsPanelProps) {
  const isRTL = lang === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-3">
      <StrikeGauge probability={strikeProbability} isRTL={isRTL} />

      {SLIDERS.map(s => (
        <SliderRow
          key={s.key}
          config={s}
          value={physics[s.key] as number}
          onChange={val => onChange(s.key, val)}
          isRTL={isRTL}
        />
      ))}

      <OilPatternPicker
        current={physics.oilPattern}
        onChange={val => onChange('oilPattern', val)}
        isRTL={isRTL}
      />
    </div>
  );
}
