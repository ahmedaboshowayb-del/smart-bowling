'use client';
import { useState, useEffect } from 'react';
import type { Language } from '@/types/bowling';
import { NAV_ITEMS } from '@/lib/constants';

interface NavbarProps {
  lang: Language;
  onLangChange: (l: Language) => void;
}

export default function Navbar({ lang, onLangChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isRTL = lang === 'ar';

  return (
    <nav
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-blue to-electric-blue opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-0 rounded-full border border-neon-blue/40 group-hover:border-neon-blue/80 transition-colors" />
            <svg viewBox="0 0 36 36" className="w-9 h-9 relative z-10">
              <circle cx="18" cy="18" r="12" fill="#050508" stroke="#00D4FF" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="2.5" fill="#00D4FF" opacity="0.9" />
              <circle cx="22" cy="13" r="2.5" fill="#00D4FF" opacity="0.9" />
              <circle cx="18" cy="22" r="2.5" fill="#00D4FF" opacity="0.9" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#0066FF" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-none">
              {isRTL ? 'محاكي البولينج' : 'Smart Bowling'}
            </span>
            <span className="text-[10px] text-neon-blue font-mono tracking-widest uppercase opacity-80">
              {isRTL ? 'المحاكي الذكي' : 'Simulator Pro'}
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm text-white/60 hover:text-neon-blue rounded-lg transition-all duration-200 hover:bg-neon-blue/5 font-medium"
            >
              {isRTL ? item.labelAr : item.label}
            </a>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
            className="btn-neon px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider"
          >
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>

          {/* Launch CTA */}
          <a
            href="#simulator"
            className="hidden sm:flex btn-primary px-5 py-2 rounded-full text-sm font-semibold"
          >
            {isRTL ? 'ابدأ المحاكاة' : 'Launch Simulator'}
          </a>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="glass-strong border-t border-neon-blue/10 px-4 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm text-white/70 hover:text-neon-blue rounded-lg hover:bg-neon-blue/5 transition-all"
            >
              {isRTL ? item.labelAr : item.label}
            </a>
          ))}
          <a
            href="#simulator"
            onClick={() => setMobileOpen(false)}
            className="mt-2 btn-primary px-5 py-3 rounded-xl text-sm font-semibold text-center"
          >
            {isRTL ? 'ابدأ المحاكاة' : 'Launch Simulator'}
          </a>
        </div>
      </div>
    </nav>
  );
}
