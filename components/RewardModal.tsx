'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Language } from '@/types/bowling';

interface Props {
  code: string;
  lang: Language;
  onClose: () => void;
}

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  '#FFD700', '#FFA500', '#FF8C00',
  '#00D4FF', '#0066FF', '#00FFFF',
  '#00FF88', '#00CC66',
  '#FF3366', '#FF6B6B',
  '#8B00FF', '#B044FF',
  '#FFB800', '#FFFFFF', '#C0C0C0',
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  w: number; h: number;
  rotation: number; rotSpeed: number;
  shape: 0 | 1 | 2; // 0 = rect, 1 = circle, 2 = triangle
}

function makeParticle(width: number, scatterY = false): Particle {
  return {
    x: Math.random() * width,
    y: scatterY ? Math.random() * -200 : -15,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * 5 + 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    w: Math.random() * 13 + 5,
    h: Math.random() * 7 + 3,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.28,
    shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
  };
}

// ── Sound ─────────────────────────────────────────────────────────────────────

function playCelebration(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx() as AudioContext;

    const arpeggio = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
    arpeggio.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.11;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.start(t); o.stop(t + 0.6);
    });

    // Final triumphant chord
    [523.25, 659.25, 783.99, 1046.5].forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = freq;
      const t = ctx.currentTime + 0.85;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      o.start(t); o.stop(t + 2.3);
    });
  } catch {
    /* audio not available — silent fallback */
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RewardModal({ code, lang, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [copied, setCopied] = useState(false);
  const isAr = lang === 'ar';

  /* Confetti animation + sound */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initial burst
    for (let i = 0; i < 220; i++) {
      particles.current.push(makeParticle(canvas.width, true));
    }

    playCelebration();

    let frame = 0;
    const animate = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);

      // Continuous trickle
      if (frame % 5 === 0 && particles.current.length < 380) {
        for (let i = 0; i < 7; i++) {
          particles.current.push(makeParticle(canvas.width));
        }
      }

      particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.09;
        p.vx *= 0.994;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 40) return false;

        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rotation);
        ctx2d.fillStyle = p.color;
        ctx2d.globalAlpha = Math.max(0, 1 - p.y / (canvas.height * 1.05));

        if (p.shape === 0) {
          ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 1) {
          ctx2d.beginPath();
          ctx2d.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx2d.fill();
        } else {
          ctx2d.beginPath();
          ctx2d.moveTo(0, -p.w / 2);
          ctx2d.lineTo(p.w / 2, p.h / 2);
          ctx2d.lineTo(-p.w / 2, p.h / 2);
          ctx2d.closePath();
          ctx2d.fill();
        }
        ctx2d.restore();
        return true;
      });

      frame++;
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particles.current = [];
    };
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // Fallback for browsers that block clipboard
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [code]);

  const stepsEn = [
    'Take a screenshot of this screen.',
    'Share the screenshot in the public group.',
    'Contact me privately on WhatsApp.',
    'Send the reward code shown below.',
  ];
  const stepsAr = [
    'قم بأخذ لقطة شاشة لهذه الصفحة.',
    'شارك لقطة الشاشة في الجروب العام.',
    'تواصل معي على الواتساب بشكل خاص.',
    'أرسل رمز الجائزة الظاهر بالأسفل.',
  ];

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes gradientBorder {
          0%   { background-position: 0% 50%; }
          100% { background-position: 400% 50%; }
        }
        @keyframes trophyFloat {
          0%,100% { transform: translateY(0px) rotate(-4deg) scale(1); }
          50%      { transform: translateY(-14px) rotate(4deg) scale(1.08); }
        }
        @keyframes shimmerSweep {
          0%   { transform: translateX(-160%); }
          100% { transform: translateX(160%); }
        }
        @keyframes codeGlow {
          0%,100% { filter: drop-shadow(0 0 12px rgba(255,215,0,0.5)); }
          50%      { filter: drop-shadow(0 0 28px rgba(255,215,0,0.9)); }
        }
      `}</style>

      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Reward Modal"
      >
        {/* Confetti canvas — floats above everything */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 30 }}
        />

        {/* Dark blurred backdrop — clicking it closes modal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 cursor-pointer"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(25,5,70,0.93) 0%, rgba(0,0,8,0.97) 100%)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 5,
          }}
          onClick={onClose}
        />

        {/* ── Modal card ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.35, opacity: 0, y: 70 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 230, delay: 0.08 }}
          className="relative w-full max-w-2xl"
          style={{ zIndex: 10 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Animated gradient border wrapper */}
          <div
            style={{
              padding: '2px',
              borderRadius: '28px',
              background: 'linear-gradient(90deg,#FFD700,#00D4FF,#8B00FF,#FF3366,#00FF88,#FFD700)',
              backgroundSize: '400% 100%',
              animation: 'gradientBorder 3s linear infinite',
              boxShadow: '0 0 60px rgba(255,215,0,0.25), 0 0 120px rgba(139,0,255,0.15)',
            }}
          >
            {/* Inner dark card */}
            <div
              dir={isAr ? 'rtl' : 'ltr'}
              style={{
                borderRadius: '26px',
                background: 'linear-gradient(160deg,rgba(10,4,35,0.99) 0%,rgba(4,2,18,0.99) 100%)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Shimmer sweep overlay */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)',
                  animation: 'shimmerSweep 5s linear infinite',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />

              {/* Faint grid */}
              <div
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                  backgroundImage: [
                    'linear-gradient(rgba(255,215,0,0.035) 1px,transparent 1px)',
                    'linear-gradient(90deg,rgba(255,215,0,0.035) 1px,transparent 1px)',
                  ].join(','),
                  backgroundSize: '44px 44px',
                }}
              />

              <div className="relative p-6 sm:p-8 flex flex-col gap-5" style={{ zIndex: 2 }}>

                {/* Trophy */}
                <div className="text-center select-none" style={{ lineHeight: 1 }}>
                  <span
                    style={{
                      fontSize: '5.5rem',
                      display: 'inline-block',
                      animation: 'trophyFloat 2.4s ease-in-out infinite',
                    }}
                  >
                    🏆
                  </span>
                </div>

                {/* Titles */}
                <div className="text-center space-y-1 px-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="text-xl sm:text-2xl font-black leading-tight"
                    dir="ltr"
                    style={{
                      background: 'linear-gradient(135deg,#FFD700 0%,#FFA500 55%,#FF8C00 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    🎉 Congratulations! You Won The Prize! 🎉
                  </motion.h1>
                  <motion.h2
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.48 }}
                    className="text-xl sm:text-2xl font-black leading-tight"
                    dir="rtl"
                    style={{
                      background: 'linear-gradient(135deg,#FFD700 0%,#FFA500 55%,#FF8C00 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontFamily: 'Cairo, system-ui, sans-serif',
                    }}
                  >
                    🎉 مبروك! لقد ربحت الجائزة! 🎉
                  </motion.h2>
                </div>

                {/* Instructions — two columns */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.54 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {/* English column */}
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(0,212,255,0.07)',
                      border: '1px solid rgba(0,212,255,0.28)',
                    }}
                  >
                    <p
                      className="text-[10px] font-mono uppercase tracking-widest text-center mb-3"
                      style={{ color: '#00D4FF' }}
                    >
                      Instructions
                    </p>
                    <ol className="space-y-2" dir="ltr">
                      {stepsEn.map((step, i) => (
                        <li key={i} className="flex gap-2 text-xs text-white/75">
                          <span className="font-bold shrink-0" style={{ color: '#00D4FF' }}>
                            {i + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Arabic column */}
                  <div
                    className="rounded-2xl p-4"
                    dir="rtl"
                    style={{
                      background: 'rgba(139,0,255,0.07)',
                      border: '1px solid rgba(139,0,255,0.28)',
                    }}
                  >
                    <p
                      className="text-[10px] font-mono uppercase tracking-widest text-center mb-3"
                      style={{ color: '#B044FF', fontFamily: 'Cairo, system-ui, sans-serif' }}
                    >
                      التعليمات
                    </p>
                    <ol className="space-y-2">
                      {stepsAr.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs text-white/75"
                          style={{ fontFamily: 'Cairo, system-ui, sans-serif' }}
                        >
                          <span className="font-bold shrink-0" style={{ color: '#B044FF' }}>
                            {i + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>

                {/* Reward code box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.62, type: 'spring', stiffness: 190 }}
                  className="rounded-2xl p-5 text-center space-y-4"
                  style={{
                    background: 'linear-gradient(135deg,rgba(255,215,0,0.11) 0%,rgba(255,140,0,0.07) 100%)',
                    border: '2px solid rgba(255,215,0,0.55)',
                    boxShadow: '0 0 40px rgba(255,215,0,0.14),inset 0 1px 0 rgba(255,215,0,0.18)',
                  }}
                >
                  <p
                    className="text-[10px] font-mono uppercase tracking-widest"
                    style={{ color: '#FFD700' }}
                  >
                    {isAr ? 'رمز الجائزة' : 'Reward Code'}
                  </p>

                  {/* The code — large + glow */}
                  <div
                    className="text-3xl sm:text-4xl font-black font-mono tracking-[0.18em] select-all"
                    style={{
                      background: 'linear-gradient(135deg,#FFE066 0%,#FFD700 40%,#FFA500 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'codeGlow 2.5s ease-in-out infinite',
                    }}
                  >
                    {code}
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className="px-7 py-2.5 rounded-xl font-black text-sm cursor-pointer transition-transform active:scale-95"
                    style={{
                      background: copied
                        ? 'linear-gradient(135deg,#00FF88,#00D4FF)'
                        : 'linear-gradient(135deg,#FFD700,#FFA500)',
                      color: '#050508',
                      boxShadow: copied
                        ? '0 0 30px rgba(0,255,136,0.55)'
                        : '0 0 30px rgba(255,215,0,0.5)',
                      border: 'none',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {copied
                      ? (isAr ? '✓ تم النسخ!' : '✓ Code Copied!')
                      : (isAr ? '📋 نسخ الرمز' : '📋 Copy Code')}
                  </button>
                </motion.div>

                {/* Screenshot reminder banner */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.78 }}
                  className="rounded-xl px-4 py-3 text-center"
                  style={{
                    background: 'rgba(255,184,0,0.09)',
                    border: '1px solid rgba(255,184,0,0.35)',
                  }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{
                      color: '#FFB800',
                      fontFamily: isAr ? 'Cairo, system-ui, sans-serif' : undefined,
                    }}
                  >
                    📸&nbsp;
                    {isAr
                      ? 'تذكر: خذ لقطة شاشة قبل الإغلاق!'
                      : 'Remember: Take a screenshot before closing!'}
                  </span>
                </motion.div>

                {/* Bowling-themed animated decoration */}
                <div className="flex justify-center items-center gap-3 select-none" aria-hidden>
                  {(['🎳', '⭐', '🏆', '⭐', '🎳'] as const).map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-2xl"
                      animate={{ y: [0, -9, 0], scale: [1, 1.18, 1] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut',
                      }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>

                {/* Close button */}
                <div className="flex justify-center">
                  <button
                    onClick={onClose}
                    className="px-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.13)',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
                    }}
                  >
                    {isAr ? '✕ إغلاق' : '✕ Close'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
