'use client';
import type { Language } from '@/types/bowling';

interface FooterProps { lang: Language; }

export default function Footer({ lang }: FooterProps) {
  const isRTL = lang === 'ar';

  return (
    <footer dir={isRTL ? 'rtl' : 'ltr'} className="relative pt-16 pb-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-bg-primary" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, #00D4FF, #0066FF, transparent)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-blue to-electric-blue opacity-20" />
                <div className="absolute inset-0 rounded-full border border-neon-blue/40" />
                <svg viewBox="0 0 36 36" className="w-10 h-10 relative z-10">
                  <circle cx="18" cy="18" r="12" fill="#050508" stroke="#00D4FF" strokeWidth="1.5" />
                  <circle cx="14" cy="14" r="2.5" fill="#00D4FF" opacity="0.9" />
                  <circle cx="22" cy="13" r="2.5" fill="#00D4FF" opacity="0.9" />
                  <circle cx="18" cy="22" r="2.5" fill="#00D4FF" opacity="0.9" />
                </svg>
              </div>
              <div>
                <div className="text-base font-black text-white">Smart Bowling Simulator</div>
                <div className="text-[10px] text-neon-blue font-mono tracking-widest uppercase">
                  {isRTL ? 'المحاكي الهندسي' : 'Engineering · Physics · AI'}
                </div>
              </div>
            </div>
            <p className="text-sm text-white/35 leading-relaxed max-w-sm">
              {isRTL
                ? 'منصة محاكاة هندسية متقدمة تجمع بين فيزياء البولينج الدقيقة والذكاء الاصطناعي وتقنيات الاستشعار الحديثة لتحليل الأداء الرياضي بدقة علمية.'
                : 'An advanced engineering simulation platform combining precision bowling physics, AI intelligence, and cutting-edge sensor technology for scientific sports performance analysis.'
              }
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2 mt-5">
              {['Three.js', 'Rapier Physics', 'React Three Fiber', 'Next.js 16', 'Tailwind v4'].map(tech => (
                <span key={tech}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-neon-blue/8 text-neon-blue border border-neon-blue/20">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: isRTL ? 'الرئيسية' : 'Home', href: '#hero' },
                { label: isRTL ? 'المحاكي' : 'Simulator', href: '#simulator' },
                { label: isRTL ? 'لوحة التحليل' : 'Dashboard', href: '#dashboard' },
                { label: isRTL ? 'التقنيات' : 'Technology', href: '#technology' },
                { label: isRTL ? 'التحليلات' : 'Analytics', href: '#analytics' },
                { label: isRTL ? 'التعليم' : 'Education', href: '#education' },
              ].map(({ label, href }) => (
                <a key={href} href={href}
                  className="text-sm text-white/40 hover:text-neon-blue transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neon-blue/40" />
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Engineering Stats */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              {isRTL ? 'إحصاءات المشروع' : 'Project Stats'}
            </h4>
            <div className="space-y-3">
              {[
                { label: isRTL ? 'نقاط الفيزياء' : 'Physics Points', value: '5,000+', color: '#00D4FF' },
                { label: isRTL ? 'الإطارات/ثانية' : 'Target FPS', value: '60 fps', color: '#00FF88' },
                { label: isRTL ? 'دقة المستشعر' : 'Sensor Precision', value: '0.1 mm', color: '#FFB800' },
                { label: isRTL ? 'بيانات التدريب' : 'Training Data', value: '10M+', color: '#8B00FF' },
                { label: isRTL ? 'لغات البرمجة' : 'Languages', value: 'EN / عربي', color: '#FF3366' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-white/35">{label}</span>
                  <span className="text-xs font-black font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent mb-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] text-white/25 font-mono">
              {isRTL
                ? '© 2026 محاكي البولينج الذكي — مشروع هندسي'
                : '© 2026 Smart Bowling Simulator — Engineering Project'
              }
            </div>
            <div className="text-[11px] font-semibold" style={{ color: 'rgba(0,212,255,0.6)' }}>
              {isRTL
                ? 'أحمد أبو شعيب — Ahmed Abo Shoaib'
                : 'Ahmed Abo Shoaib — أحمد أبو شعيب'
              }
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {isRTL ? 'النظام يعمل' : 'Systems Online'}
            </div>
            <div className="text-[10px] font-mono text-white/25">
              {isRTL ? 'بُني بـ' : 'Built with'}{' '}
              <span className="text-neon-blue">Three.js</span> &{' '}
              <span className="text-neon-blue">Rapier</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
