/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          dark: '#080808',
          carbon: '#111111',
          gray: '#1a1a1a',
          silver: '#C0C0C0',
          gold: '#FFD700',
        },
        team: {
          redbull: '#3671C6',
          ferrari: '#E8002D',
          mercedes: '#27F4D2',
          mclaren: '#FF8000',
          alpine: '#FF87BC',
          aston: '#229971',
          williams: '#64C4FF',
          haas: '#B6BABD',
          sauber: '#52E252',
          rb: '#6692FF',
        }
      },
      fontFamily: {
        formula: ['var(--font-formula)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'race': 'race 8s linear infinite',
        'pulse-red': 'pulse-red 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'car-zoom': 'carZoom 0.3s ease-out',
        'track-draw': 'trackDraw 2s ease-out forwards',
      },
      keyframes: {
        race: {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(225, 6, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(225, 6, 0, 0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        trackDraw: {
          from: { strokeDashoffset: '2000' },
          to: { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
