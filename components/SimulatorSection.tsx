'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { CameraView, Language, GameState } from '@/types/bowling';
import type { useBowlingPhysics } from '@/hooks/useBowlingPhysics';
import PhysicsPanel from './PhysicsPanel';
import CameraControls from './CameraControls';

const BowlingGame = dynamic(() => import('./BowlingGame'), { ssr: false });

interface SimulatorProps {
  lang: Language;
  /** Shared bowling-physics instance lifted from page.tsx */
  bowling: ReturnType<typeof useBowlingPhysics>;
}

/* Live feedback metric */
function LiveMetric({
  label, value, unit, color, glow = false,
}: {
  label: string; value: string | number; unit?: string; color: string; glow?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-white/35 uppercase tracking-wider font-mono">{label}</span>
      <span
        className="text-base font-black font-mono tabular-nums"
        style={{ color, textShadow: glow ? `0 0 10px ${color}80` : 'none' }}
      >
        {value}
        {unit && <span className="text-[10px] font-medium opacity-50 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

/* Simulation status badge */
function StatusBadge({ gameState, isPaused, isSlowMo, isRTL }: {
  gameState: GameState; isPaused: boolean; isSlowMo: boolean; isRTL: boolean;
}) {
  const map: Record<GameState, { label: string; labelAr: string; color: string; pulse: boolean }> = {
    idle:     { label: '⏸ READY',    labelAr: '⏸ جاهز',         color: '#FFFFFF50', pulse: false },
    aiming:   { label: '🎯 AIMING',   labelAr: '🎯 تصويب',        color: '#FFB800',   pulse: true  },
    rolling:  { label: '▶ ROLLING',   labelAr: '▶ جاري الرمي',   color: '#00D4FF',   pulse: true  },
    impact:   { label: '💥 IMPACT',   labelAr: '💥 تصادم',        color: '#FF3366',   pulse: true  },
    complete: { label: '✓ COMPLETE',  labelAr: '✓ مكتمل',         color: '#00FF88',   pulse: false },
  };
  const s = map[gameState];
  const effectiveLabel = isPaused ? (isRTL ? '⏸ متوقف' : '⏸ PAUSED')
    : isSlowMo && gameState === 'rolling' ? (isRTL ? '🐢 بطيء' : '🐢 SLOW-MO')
    : (isRTL ? s.labelAr : s.label);

  return (
    <div
      className="flex items-center gap-2 hud-panel px-3 py-1.5 text-xs font-mono"
      style={{ borderColor: `${s.color}40` }}
    >
      {s.pulse && !isPaused && (
        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: s.color }} />
      )}
      <span style={{ color: s.color }}>{effectiveLabel}</span>
    </div>
  );
}

export default function SimulatorSection({ lang, bowling }: SimulatorProps) {
  const isRTL = lang === 'ar';

  const [cameraView, setCameraView]     = useState<CameraView>('front');
  const [knocked, setKnocked]           = useState<Set<number>>(new Set());
  const [pinCount, setPinCount]         = useState(0);
  const [isPaused, setIsPaused]         = useState(false);
  const [isSlowMo, setIsSlowMo]         = useState(false);
  const [showTraj, setShowTraj]         = useState(true);
  const [distanceTravelled, setDist]    = useState(0);
  const [lastPhysics, setLastPhysics]   = useState<null | { speed: number; angle: number; spin: number }>(null);
  const distIntervalRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Use the shared instance passed from page.tsx */
  const {
    physics, updatePhysics, gameState, result, liveFrames,
    throwBall, reportActualPins, reset, strikeProbability,
  } = bowling;

  /* Track simulated distance while rolling */
  useEffect(() => {
    if (gameState === 'rolling') {
      setDist(0);
      const speedMs = physics.speed / 3.6;
      distIntervalRef.current = setInterval(() => {
        setDist(d => Math.min(18.29, d + speedMs * 0.05));
      }, 50);
    } else {
      if (distIntervalRef.current) clearInterval(distIntervalRef.current);
      if (gameState === 'complete' || gameState === 'impact') setDist(18.29);
    }
    return () => { if (distIntervalRef.current) clearInterval(distIntervalRef.current); };
  }, [gameState, physics.speed]);

  /*
   * When the throw completes, report the ACTUAL 3D pin count back to the
   * shared hook so Dashboard / Analytics receive the real number.
   * We use a ref to avoid a stale closure over `knocked`.
   */
  const knockedRef = useRef(knocked);
  knockedRef.current = knocked;

  useEffect(() => {
    if (gameState === 'complete') {
      reportActualPins(knockedRef.current.size);
    }
  }, [gameState, reportActualPins]);

  const handlePinKnocked = useCallback((count: number) => setPinCount(count), []);
  const handleKnockedChange = useCallback((s: Set<number>) => setKnocked(s), []);

  const handleReset = useCallback(() => {
    reset();
    setKnocked(new Set());
    setPinCount(0);
    setDist(0);
    setIsPaused(false);
  }, [reset]);

  const handleReplay = useCallback(() => {
    handleReset();
    setTimeout(() => throwBall(), 220);
  }, [handleReset, throwBall]);

  const handleThrow = useCallback(() => {
    setLastPhysics({ speed: physics.speed, angle: physics.angle, spin: physics.spinRate });
    throwBall();
  }, [physics, throwBall]);

  const isRolling  = gameState === 'rolling';
  const isComplete = gameState === 'complete' || gameState === 'impact';

  /*
   * GROUND TRUTH: always use knocked.size from the actual 3D collision
   * detection — never the hook's estimated result.pinsKnocked.
   */
  /* Always use real 3D collision count – isStrikeReal is the authoritative flag */
  const actualPins  = knocked.size;
  const isStrike    = isComplete && actualPins === 10;

  /* Live speed from frames (or static) */
  const currentFrame = liveFrames[liveFrames.length - 1];
  const liveSpeed = currentFrame?.speed ?? physics.speed;
  const liveRPM   = currentFrame?.rpm ?? physics.spinRate;

  /* Computed metrics */
  const speedMs = physics.speed / 3.6;
  const impactN = result?.impactForce ?? (0.5 * physics.weight * speedMs * speedMs).toFixed(1);

  return (
    <section id="simulator" dir={isRTL ? 'rtl' : 'ltr'} className="relative py-20 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-bg-secondary grid-bg opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <span className="section-label">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse inline-block" />
            {isRTL ? 'المحاكي التفاعلي ثلاثي الأبعاد' : 'Interactive 3D Physics Simulator'}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black text-white">
            {isRTL ? 'أطلق' : 'Control'}{' '}
            <span className="gradient-text">{isRTL ? 'كرتك' : 'the Physics'}</span>
          </h2>
          <p className="mt-2 text-white/40 text-sm max-w-lg mx-auto">
            {isRTL
              ? 'اضبط كل معامل فيزيائي بدقة واضغط أطلق لمشاهدة المحاكاة الحية'
              : 'Tune every physical parameter precisely and launch to see live simulation'
            }
          </p>
        </div>

        {/* ── Three-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_260px] gap-4">

          {/* ── LEFT: Physics Control Panel ── */}
          <div className="order-2 xl:order-1 max-h-[750px] overflow-y-auto pr-1 space-y-3">
            <div className="hud-panel px-3 py-2 flex items-center gap-2 sticky top-0 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              <span className="text-[10px] font-mono text-neon-blue uppercase tracking-wider">
                {isRTL ? 'التحكم الفيزيائي' : 'Physics Control Panel'}
              </span>
              <span className="ml-auto text-[9px] text-white/25 font-mono">
                {isRTL ? 'انقر القيمة للتعديل' : 'Click value to edit'}
              </span>
            </div>
            <PhysicsPanel
              physics={physics}
              onChange={updatePhysics}
              strikeProbability={strikeProbability}
              lang={lang}
            />
          </div>

          {/* ── CENTER: 3D Game Canvas ── */}
          <div className="order-1 xl:order-2 flex flex-col gap-3">
            {/* Camera controls */}
            <div className="hud-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-white/35 uppercase tracking-widest font-mono">
                {isRTL ? 'الكاميرا' : 'Camera'}
              </span>
              <CameraControls current={cameraView} onChange={setCameraView} lang={lang} />
              {/* Trajectory toggle */}
              <button
                onClick={() => setShowTraj(t => !t)}
                className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-all ${
                  showTraj
                    ? 'bg-neon-blue/15 border-neon-blue/40 text-neon-blue'
                    : 'border-white/10 text-white/30 hover:border-white/25'
                }`}
              >
                {isRTL ? '📐 المسار' : '📐 Trajectory'}
              </button>
            </div>

            {/* 3D Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-neon-blue/12 shadow-glass"
              style={{ height: '460px' }}
            >
              <BowlingGame
                physics={physics}
                gameState={gameState}
                cameraView={cameraView}
                isPaused={isPaused}
                isSlowMo={isSlowMo}
                knocked={knocked}
                onKnockedChange={handleKnockedChange}
                onPinKnocked={handlePinKnocked}
                showTrajectory={showTraj}
              />

              {/* HUD overlay – top */}
              <div className="absolute top-2 left-2 right-2 pointer-events-none flex justify-between items-start gap-2">
                <StatusBadge gameState={gameState} isPaused={isPaused} isSlowMo={isSlowMo} isRTL={isRTL} />
                <div className="hud-panel px-3 py-1.5 text-[10px] font-mono text-white/40">
                  {isRTL ? 'الأقماع:' : 'PINS:'}{' '}
                  <span className="text-neon-blue font-bold">{10 - knocked.size}/10</span>
                </div>
              </div>

              {/* Live speed / rpm during roll */}
              {isRolling && !isPaused && (
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex gap-2">
                  {[
                    { label: isRTL ? 'سرعة' : 'SPEED', value: `${liveSpeed.toFixed(1)}`, unit: 'km/h', color: '#00D4FF' },
                    { label: isRTL ? 'دوران' : 'SPIN',  value: `${Math.round(liveRPM)}`,   unit: 'RPM',  color: '#00FF88' },
                    { label: isRTL ? 'مسافة' : 'DIST',  value: `${distanceTravelled.toFixed(1)}`, unit: 'm', color: '#FFB800' },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="hud-panel px-3 py-1.5 flex-1 text-center">
                      <div className="text-[9px] text-white/30 font-mono">{label}</div>
                      <div className="text-sm font-black font-mono" style={{ color }}>{value} <span className="text-[9px] opacity-50">{unit}</span></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strike overlay — only when ALL 10 real pins are knocked */}
              {isStrike && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center animate-[fadeInUp_0.4s_ease-out]">
                    <div className="text-7xl sm:text-8xl font-black gradient-text animate-bounce-slow">
                      STRIKE!
                    </div>
                    <div className="text-neon-blue text-xl font-mono mt-2 animate-pulse">
                      🎳 {isRTL ? 'مثالي!' : 'Perfect Throw!'}
                    </div>
                  </div>
                </div>
              )}

              {/* Non-strike result — show actual 3D count */}
              {isComplete && !isStrike && (
                <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                  <div className="hud-panel px-6 py-3 text-center animate-[fadeIn_0.4s_ease-out]">
                    <div className="text-3xl font-black text-neon-blue">{actualPins}</div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {isRTL ? 'قمع مُسقط' : 'pins knocked'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Control bar ── */}
            <div className="hud-panel px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
              {/* Current params summary */}
              <div className="flex gap-4 flex-wrap flex-1">
                {[
                  { label: isRTL ? 'سرعة' : 'Speed',  value: `${physics.speed.toFixed(1)}`, unit: 'km/h', color: '#00D4FF' },
                  { label: isRTL ? 'زاوية' : 'Angle',  value: `${physics.angle.toFixed(1)}`, unit: '°',   color: '#8B00FF' },
                  { label: isRTL ? 'دوران' : 'Spin',   value: `${physics.spinRate}`,          unit: 'RPM', color: '#00FF88' },
                  { label: isRTL ? 'وزن' : 'Weight',   value: `${physics.weight.toFixed(1)}`, unit: 'kg',  color: '#FFB800' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="text-center min-w-[52px]">
                    <div className="text-[9px] text-white/30 font-mono uppercase">{label}</div>
                    <div className="text-sm font-black font-mono" style={{ color }}>
                      {value}<span className="text-[9px] opacity-50 ml-px">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Slow Motion */}
                <button
                  onClick={() => setIsSlowMo(s => !s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSlowMo
                      ? 'bg-warning/20 border-warning/50 text-warning'
                      : 'btn-neon'
                  }`}
                  title={isRTL ? 'الحركة البطيئة' : 'Slow Motion'}
                >
                  🐢 {isRTL ? 'بطيء' : 'Slow'}
                </button>

                {/* Pause / Resume (only while rolling) */}
                {isRolling && (
                  <button
                    onClick={() => setIsPaused(p => !p)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isPaused ? 'bg-success/20 border-success/50 text-success' : 'btn-neon'
                    }`}
                  >
                    {isPaused ? (isRTL ? '▶ استأنف' : '▶ Resume') : (isRTL ? '⏸ إيقاف' : '⏸ Pause')}
                  </button>
                )}

                {/* Reset */}
                {(isComplete || gameState === 'idle') && (
                  <button onClick={handleReset} className="btn-neon px-4 py-2 rounded-xl text-xs font-semibold">
                    {isRTL ? '↺ إعادة' : '↺ Reset'}
                  </button>
                )}

                {/* Replay */}
                {isComplete && (
                  <button onClick={handleReplay} className="btn-neon px-4 py-2 rounded-xl text-xs font-semibold">
                    {isRTL ? '⟳ إعادة تشغيل' : '⟳ Replay'}
                  </button>
                )}

                {/* Launch */}
                <button
                  onClick={handleThrow}
                  disabled={isRolling || gameState === 'impact'}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isRolling || gameState === 'impact'
                      ? 'bg-white/8 border border-white/12 text-white/25 cursor-not-allowed'
                      : 'btn-primary shadow-neon'
                  }`}
                >
                  {isRolling
                    ? (isRTL ? '🎳 جاري...' : '🎳 Rolling…')
                    : (isRTL ? '🎳 أطلق' : '🎳 Launch')}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Live Feedback Panel ── */}
          <div className="order-3 flex flex-col gap-3">
            {/* Header */}
            <div className="hud-panel px-3 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-mono text-success uppercase tracking-wider">
                {isRTL ? 'التغذية الراجعة المباشرة' : 'Live Feedback'}
              </span>
            </div>

            {/* Live metrics grid */}
            <div className="stat-card grid grid-cols-2 gap-4 py-4">
              <LiveMetric label={isRTL ? 'السرعة' : 'Speed'}   value={liveSpeed.toFixed(1)} unit="km/h" color="#00D4FF" glow />
              <LiveMetric label={isRTL ? 'الدوران' : 'Spin'}   value={Math.round(liveRPM)} unit="RPM"   color="#00FF88" />
              <LiveMetric label={isRTL ? 'الزاوية' : 'Angle'}  value={`${physics.angle.toFixed(1)}°`}   color="#8B00FF" />
              <LiveMetric label={isRTL ? 'المسافة' : 'Distance'} value={`${distanceTravelled.toFixed(1)}`} unit="m" color="#FFB800" />
            </div>

            {/* Impact data */}
            <div className="stat-card">
              <div className="text-[10px] text-white/35 uppercase tracking-wider mb-3">
                {isRTL ? 'بيانات التأثير' : 'Impact Data'}
              </div>
              <div className="space-y-2.5">
                {[
                  { label: isRTL ? 'قوة التأثير' : 'Impact Force',      value: result ? `${result.impactForce.toFixed(1)} N` : `~${impactN} N`, color: '#FF3366' },
                  { label: isRTL ? 'نقل الطاقة' : 'Energy Transfer',    value: result ? `${result.energyTransfer.toFixed(1)} J` : '—',             color: '#FFB800' },
                  { label: isRTL ? 'الأقماع المُسقطة' : 'Pins Knocked', value: isComplete ? `${actualPins}/10` : '—',                              color: actualPins === 10 ? '#00FF88' : '#FFB800' },
                  { label: isRTL ? 'الاحتمالية' : 'Strike Prob.',        value: `${Math.round(strikeProbability)}%`,                                color: '#00D4FF' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-white/35 font-mono truncate">{label}</span>
                    <span className="text-sm font-black font-mono shrink-0" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trajectory top-down preview */}
            <div className="stat-card">
              <div className="text-[10px] text-white/35 uppercase tracking-wider mb-2">
                {isRTL ? 'معاينة المسار (أعلى)' : 'Trajectory (Top View)'}
              </div>
              <div className="relative rounded-lg overflow-hidden bg-bg-primary/60" style={{ height: '120px' }}>
                <svg viewBox="0 0 140 100" className="w-full h-full">
                  {/* Lane */}
                  <rect x="35" y="0" width="70" height="100" fill="rgba(212,180,122,0.15)" />
                  {/* Gutters */}
                  <rect x="20" y="0" width="15" height="100" fill="rgba(0,0,0,0.25)" />
                  <rect x="105" y="0" width="15" height="100" fill="rgba(0,0,0,0.25)" />
                  {/* Lane borders */}
                  <line x1="35" y1="0" x2="35" y2="100" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" />
                  <line x1="105" y1="0" x2="105" y2="100" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" />
                  {/* Foul line */}
                  <line x1="35" y1="88" x2="105" y2="88" stroke="#CC2222" strokeWidth="1" opacity="0.6" />
                  {/* Arrows */}
                  {[0.15, 0.30, 0.50, 0.70, 0.85].map((p, i) => (
                    <polygon key={i}
                      points={`${35 + p*70},55 ${35 + p*70-3},62 ${35 + p*70},60 ${35 + p*70+3},62`}
                      fill="rgba(120,80,30,0.5)" />
                  ))}
                  {/* Trajectory */}
                  <path
                    d={`M${70 + physics.launchPos * 28},88 Q${70 + physics.angle * 3},60 ${70},12`}
                    fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8"
                  />
                  {/* Hook curve */}
                  <path
                    d={`M${70 + physics.launchPos * 28},88 Q${70 + physics.angle * 3 + physics.hookStrength * 8},50 ${70 - physics.hookStrength * 5},12`}
                    fill="none" stroke="#00FF88" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"
                  />
                  {/* Ball start */}
                  <circle cx={70 + physics.launchPos * 28} cy="88" r="4"
                    fill="#00D4FF" opacity="0.9" style={{ filter: 'drop-shadow(0 0 3px #00D4FF)' }} />
                  {/* Pins */}
                  {[
                    [64, 17], [70, 17], [76, 17], [82, 17],
                    [67, 23], [73, 23], [79, 23],
                    [70, 29], [76, 29], [73, 35],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5"
                      fill={knocked.has(i) ? '#FF3366' : '#F5F5EE'}
                      stroke={knocked.has(i) ? '#FF3366' : 'rgba(255,255,255,0.3)'}
                      strokeWidth="0.5" opacity={0.9}
                    />
                  ))}
                  {/* Labels */}
                  <text x="70" y="98" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="5">
                    {isRTL ? 'خط المخالفة' : 'Foul Line'}
                  </text>
                </svg>
                {/* Legend */}
                <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-[8px] font-mono">
                    <div className="w-3 h-px rounded" style={{ background: '#00D4FF' }} />
                    <span className="text-white/30">{isRTL ? 'مستقيم' : 'Straight'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-mono">
                    <div className="w-3 h-px rounded" style={{ background: '#00FF88' }} />
                    <span className="text-white/30">{isRTL ? 'انحناء' : 'Hook'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Last throw summary */}
            {lastPhysics && isComplete && (
              <div className="stat-card animate-[fadeIn_0.4s_ease-out]">
                <div className="text-[10px] text-white/35 uppercase tracking-wider mb-2">
                  {isRTL ? 'ملخص آخر رمية' : 'Last Throw Summary'}
                </div>
                <div className="space-y-1.5 text-[10px] font-mono">
                  {[
                    [`${lastPhysics.speed.toFixed(1)} km/h`, '#00D4FF'],
                    [`${lastPhysics.angle.toFixed(1)}° angle`, '#8B00FF'],
                    [`${lastPhysics.spin} RPM`, '#00FF88'],
                    [`${actualPins}/10 pins`, isStrike ? '#00FF88' : '#FFB800'],
                  ].map(([val, color], i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full" style={{ background: color }} />
                      <span style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
