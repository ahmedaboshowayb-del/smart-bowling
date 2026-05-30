import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050508',
        'bg-secondary': '#0D0D1A',
        'bg-card': '#111125',
        'neon-blue': '#00D4FF',
        'electric-blue': '#0066FF',
        'neon-cyan': '#00FFFF',
        'accent': '#00D4FF',
        'success': '#00FF88',
        'warning': '#FFB800',
        'danger': '#FF3366',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        arabic: ['Cairo', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'counter': 'counter 2s ease-out forwards',
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
        'ping-slow': 'ping 3s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,102,255,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(0,212,255,0.7), 0 0 80px rgba(0,102,255,0.4)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '60px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0,212,255,0.5)',
        'neon-lg': '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,102,255,0.3)',
        'neon-sm': '0 0 10px rgba(0,212,255,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.15)',
      },
    },
  },
  plugins: [],
}
export default config
