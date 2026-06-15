/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Friendly, premium sans stack
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Soft "lifted card" shadow used across the premium UI
        card: '0 10px 30px -12px rgba(6, 78, 59, 0.25)',
        glow: '0 0 0 3px rgba(245, 158, 11, 0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
