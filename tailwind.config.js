/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/index.html', './client/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070f',
          900: '#080b18',
          850: '#0a0e1e',
          800: '#0d1226',
          700: '#131a36',
          600: '#1b2448',
        },
        brand: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        accent: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          amber: '#fbbf24',
          emerald: '#34d399',
          rose: '#fb7185',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,.25), 0 10px 40px -10px rgba(99,102,241,.45)',
        'glow-cyan': '0 0 0 1px rgba(34,211,238,.25), 0 10px 40px -10px rgba(34,211,238,.4)',
        card: '0 1px 0 0 rgba(255,255,255,.06) inset, 0 20px 50px -20px rgba(0,0,0,.7)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
        'radial-fade': 'radial-gradient(ellipse at center, transparent 0%, rgba(5,7,15,.9) 70%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
