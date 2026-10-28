/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        dark: {
          base: '#0c0e14',
          card: '#141824',
          cardHover: '#1c2233',
          surface: '#1b2030',
          border: 'rgba(255, 255, 255, 0.08)',
          subtext: '#94a3b8',
        },
        mood: {
          happy: {
            from: '#F59E0B',
            to: '#F97316',
            glow: 'rgba(245, 158, 11, 0.35)'
          },
          energetic: {
            from: '#EF4444',
            to: '#EC4899',
            glow: 'rgba(239, 68, 68, 0.35)'
          },
          relaxed: {
            from: '#10B981',
            to: '#06B6D4',
            glow: 'rgba(16, 185, 129, 0.35)'
          },
          sad: {
            from: '#3B82F6',
            to: '#6366F1',
            glow: 'rgba(59, 130, 246, 0.35)'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'equalizer': 'equalize 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        equalize: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
