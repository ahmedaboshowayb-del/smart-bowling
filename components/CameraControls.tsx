'use client';
import type { ReactElement } from 'react';
import type { CameraView, Language } from '@/types/bowling';
import { CAMERA_VIEWS } from '@/lib/constants';

interface CameraControlsProps {
  current: CameraView;
  onChange: (v: CameraView) => void;
  lang: Language;
}

const ICONS: Record<string, ReactElement> = {
  front: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M12 5v14M3 12h18" />
    </svg>
  ),
  side: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12h18M12 3v18" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  top: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  follow: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
    </svg>
  ),
  slowmo: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  orbit: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),
};

export default function CameraControls({ current, onChange, lang }: CameraControlsProps) {
  const isRTL = lang === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-wrap gap-2">
      {CAMERA_VIEWS.map(view => {
        const isActive = current === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onChange(view.id as CameraView)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              isActive
                ? 'bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-neon-sm'
                : 'bg-white/3 border-white/10 text-white/50 hover:border-white/25 hover:text-white/80 hover:bg-white/6'
            }`}
          >
            <span className={isActive ? 'text-neon-blue' : 'text-white/40'}>
              {ICONS[view.id]}
            </span>
            <span>{isRTL ? view.labelAr : view.label}</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-neon-blue animate-pulse" />}
          </button>
        );
      })}
    </div>
  );
}
