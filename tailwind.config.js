/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slideUp': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) both',
        'fadeScale': 'fadeScale 0.25s ease-out both',
        'priceFlash': 'priceFlash 1.4s ease-out both',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeScale: {
          from: { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        priceFlash: {
          '0%': { backgroundColor: 'transparent' },
          '15%': { backgroundColor: 'rgba(139, 92, 246, 0.12)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
}
