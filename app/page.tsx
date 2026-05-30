'use client';
import { useState } from 'react';
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

export default function HomePage() {
  const [lang, setLang] = useState<Language>('en');

  /*
   * Single shared bowling-physics instance.
   * SimulatorSection receives it as a prop and drives it.
   * Dashboard and AnalyticsSection read liveFrames / result from the same
   * instance → all sections update in real-time as the ball rolls.
   */
  const bowling = useBowlingPhysics();
  const { physics, result, liveFrames } = bowling;

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
    </main>
  );
}
