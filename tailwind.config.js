/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1D',
        surface: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          dark: '#070B14',
          card: '#131C35',
          glass: 'rgba(19, 28, 53, 0.85)',
          overlay: 'rgba(10, 15, 29, 0.90)',
          border: 'rgba(255, 255, 255, 0.12)',
        },
        mood: {
          bg: '#0A0F1D',
          card: '#131C35',
          border: 'rgba(255, 255, 255, 0.12)',
          coral: '#F97316',
          amber: '#F59E0B',
          indigo: '#4F46E5',
          violet: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
        },
        brand: {
          primary: '#06B6D4',
          secondary: '#F59E0B',
          accent: '#38BDF8',
          red: '#F43F5E',
          purple: '#6366F1',
          gold: '#F59E0B',
          emerald: '#10B981',
          cyan: '#06B6D4',
          blue: '#0EA5E9',
          violet: '#818CF8',
        },
        ludo: {
          red: '#EF4444',
          blue: '#3B82F6',
          green: '#10B981',
          yellow: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -4px rgba(244, 63, 94, 0.45)',
        'glow-accent': '0 0 25px -4px rgba(56, 189, 248, 0.45)',
        'glow-gold': '0 0 25px -4px rgba(245, 158, 11, 0.45)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.45)',
        'glow-purple': '0 0 25px -4px rgba(99, 102, 241, 0.45)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.45)',
        'tv-card': '0 12px 28px -6px rgba(0, 0, 0, 0.7)',
        'tv-focus': '0 0 0 3px #FFFFFF, 0 0 28px 5px rgba(6, 182, 212, 0.45)',
        'mobile-button': '0 8px 20px -4px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'dice-shake': 'shake 0.5s ease-in-out',
        'glow-breathe': 'glowBreathe 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-15deg)' },
          '40%': { transform: 'rotate(15deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '80%': { transform: 'rotate(10deg)' },
        },
        glowBreathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
