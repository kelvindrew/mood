/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090E',
        surface: {
          DEFAULT: '#101420',
          light: '#171D2E',
          dark: '#06080C',
          card: '#121726',
          glass: 'rgba(18, 23, 38, 0.75)',
          overlay: 'rgba(7, 9, 14, 0.85)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        brand: {
          red: '#E50914',
          accent: '#FF2E63',
          purple: '#8A2BE2',
          gold: '#FFB800',
          emerald: '#10B981',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          violet: '#7C3AED',
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
        'glow-red': '0 0 30px -4px rgba(229, 9, 20, 0.65)',
        'glow-accent': '0 0 30px -4px rgba(255, 46, 99, 0.65)',
        'glow-gold': '0 0 30px -4px rgba(255, 184, 0, 0.65)',
        'glow-cyan': '0 0 30px -4px rgba(6, 182, 212, 0.65)',
        'glow-purple': '0 0 30px -4px rgba(138, 43, 226, 0.65)',
        'glow-emerald': '0 0 30px -4px rgba(16, 185, 129, 0.65)',
        'tv-card': '0 16px 36px -10px rgba(0, 0, 0, 0.9)',
        'tv-focus': '0 0 0 4px #FFFFFF, 0 0 40px 10px rgba(229, 9, 20, 0.7)',
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
