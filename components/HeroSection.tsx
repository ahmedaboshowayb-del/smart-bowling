'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Language } from '@/types/bowling';

const BowlingHeroScene = dynamic(() => import('./BowlingHeroScene'), { ssr: false });

interface HeroSectionProps { lang: Language; }

const STATS = [
  { value: '22', unit: 'km/h', label: 'Ball Speed', labelAr: 'سرعة الكرة' },
  { value: '320', unit: 'RPM', label: 'Spin Rate', labelAr: 'معدل الدوران' },
  { value: '94%', unit: '', label: 'Strike Rate', labelAr: 'معدل الضربة' },
  { value: '18.29', unit: 'm', label: 'Lane Length', labelAr: 'طول المسار' },
];

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const num = parseFloat(target.replace('%', ''));
    if (isNaN(num)) { setDisplay(target); return; }

    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (num - start) * eased;

      const formatted = Number.isInteger(num)
        ? Math.round(current).toString()
        : current.toFixed(2);
      setDisplay(formatted + (target.includes('%') ? '%' : ''));

      if (progress < 1) requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => requestAnimationFrame(tick), 500);
    return () => clearTimeout(timer);
  }, [target]);

  return <span>{display}{suffix}</span>;
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const isRTL = lang === 'ar';
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY, currentTarget } = e;
      const el = currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      // Subtle parallax on floating panels
      const panels = heroRef.current.querySelectorAll<HTMLElement>('.hud-float');
      panels.forEach((p, i) => {
        const factor = (i % 2 === 0 ? 1 : -1) * 8;
        p.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };

    heroRef.current?.addEventListener('mousemove', handleMouseMove);
    return () => heroRef.current?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <BowlingHeroScene />
      </div>

      {/* Scan line overlay */}
      <div className="absolute inset-0 z-10 scan-overlay pointer-events-none" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-bg-primary/60 via-transparent to-bg-primary/90 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-bg-primary/40 via-transparent to-bg-primary/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top HUD Bar */}
        <div className="flex items-center justify-between pt-24 pb-4">
          <div className="hud-float flex items-center gap-2 hud-panel px-4 py-2 text-xs font-mono text-neon-blue">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
            {isRTL ? 'النظام نشط' : 'SYSTEM ONLINE'}
          </div>
          <div className="hud-float hud-panel px-4 py-2 text-xs font-mono text-white/50">
            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <div className={`max-w-3xl ${isRTL ? 'mr-auto text-right' : 'ml-0 text-left'}`}>
            {/* Label */}
            <div className="animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.2s' }}>
              <span className="section-label">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-ping inline-block" />
                {isRTL ? 'نظام المحاكاة الهندسية' : 'Engineering Simulation System v3.0'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-black leading-none tracking-tight animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.4s' }}>
              <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white">
                {isRTL ? 'محاكي' : 'Smart'}
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl gradient-text mt-1">
                {isRTL ? 'البولينج الذكي' : 'Bowling'}
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white/30 mt-1 font-light">
                {isRTL ? 'محاكاة متقدمة' : 'Simulator'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-white/55 max-w-xl leading-relaxed animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.6s' }}>
              {isRTL
                ? 'محاكاة ثلاثية الأبعاد متكاملة تجمع بين فيزياء البولينج الدقيقة والذكاء الاصطناعي وتقنيات الاستشعار الحديثة لتحليل الأداء بدقة هندسية.'
                : 'A cinematic 3D bowling simulation fusing precision physics, AI performance analysis, and cutting-edge sensor technology for engineering-grade insights.'
              }
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-wrap gap-4 mt-8 animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 ${isRTL ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: '0.8s' }}>
              <a href="#simulator" className="btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold shadow-neon-lg">
                {isRTL ? '🎳 ابدأ المحاكاة' : '🎳 Launch Simulator'}
              </a>
              <a href="#dashboard" className="btn-neon px-8 py-3.5 rounded-2xl text-sm font-semibold">
                {isRTL ? '📊 لوحة التحليل' : '📊 View Analytics'}
              </a>
            </div>

            {/* Metrics Row */}
            <div className={`flex flex-wrap gap-3 mt-10 animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 ${isRTL ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: '1s' }}>
              {STATS.map((stat, i) => (
                <div key={i} className="hud-panel px-4 py-3 corner-bracket">
                  <div className="text-2xl font-black font-mono gradient-text">
                    <AnimatedCounter target={stat.value} suffix={stat.unit} />
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                    {isRTL ? stat.labelAr : stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom floating panels */}
        <div className="pb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-[fadeIn_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: '1.2s' }}>
          {[
            { label: isRTL ? 'الفيزياء' : 'Physics Engine', value: 'Rapier 3D', icon: '⚛' },
            { label: isRTL ? 'الرسوميات' : 'Graphics', value: 'WebGL 2.0', icon: '🎨' },
            { label: isRTL ? 'الذكاء' : 'AI Model', value: 'Deep LSTM', icon: '🤖' },
            { label: isRTL ? 'الدقة' : 'Precision', value: '0.1 mm', icon: '🎯' },
          ].map((item, i) => (
            <div key={i} className="hud-float glass-hover glass rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</div>
                <div className="text-xs text-neon-blue font-mono font-semibold">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-[bounceSlide_2s_ease-in-out_infinite]">
        <span className="text-[10px] text-white/30 uppercase tracking-widest">
          {isRTL ? 'اسحب للأسفل' : 'Scroll Down'}
        </span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-neon-blue animate-bounce" />
        </div>
      </div>
    </section>
  );
}
