'use client';
import { useState, useEffect } from 'react';
import type { Language } from '@/types/bowling';
import { useBowlingPhysics } from '@/hooks/useBowlingPhysics';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SimulatorSection from '@/components/SimulatorSection';
import Dashboard from '@/components/Dashboard';
import SmartTechSection from '@/components/SmartTechSection';
import AnalyticsSection from '@/components/AnalyticsSection';
import EducationSection from '@/components/EducationSection';
import Footer from '@/components/Footer';
import RewardModal from '@/components/RewardModal';

export default function HomePage() {
  const [lang, setLang] = useState<Language>('en');
  const [showReward, setShowReward] = useState(false);

  /*
   * Single shared bowling-physics instance.
   * SimulatorSection drives it; Dashboard and AnalyticsSection read from it.
   */
  const bowling = useBowlingPhysics();
  const { physics, result, liveFrames, rewardCode } = bowling;

  /* Show the reward modal as soon as the server issues a code */
  useEffect(() => {
    if (rewardCode) setShowReward(true);
  }, [rewardCode]);

  return (
    <main className="bg-bg-primary text-white overflow-x-hidden">
      <Navbar lang={lang} onLangChange={setLang} />
      <HeroSection lang={lang} />
      <SimulatorSection lang={lang} bowling={bowling} />
      <Dashboard lang={lang} physics={physics} frames={liveFrames} result={result} />
      <SmartTechSection lang={lang} />
      <AnalyticsSection lang={lang} liveFrames={liveFrames} />
      <EducationSection lang={lang} />
      <Footer lang={lang} />

      {/* ── Reward modal ───────────────────────────────────────────────────── */}
      {rewardCode && showReward && (
        <RewardModal
          code={rewardCode}
          lang={lang}
          onClose={() => setShowReward(false)}
        />
      )}

      {/*
       * Floating "View Prize" button — appears only after the reward has been
       * won and the modal is dismissed, so the player can reopen it anytime
       * without losing their code before they screenshot it.
       */}
      {rewardCode && !showReward && (
        <button
          onClick={() => setShowReward(true)}
          aria-label={lang === 'ar' ? 'عرض الجائزة' : 'View Prize'}
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl font-black text-sm cursor-pointer transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#FFD700,#FFA500)',
            color: '#050508',
            boxShadow: '0 0 35px rgba(255,215,0,0.55), 0 6px 24px rgba(0,0,0,0.5)',
            animation: 'float 3s ease-in-out infinite',
            border: 'none',
            letterSpacing: '0.02em',
          }}
        >
          🏆 {lang === 'ar' ? 'عرض الجائزة' : 'View Prize'}
        </button>
      )}
    </main>
  );
}
