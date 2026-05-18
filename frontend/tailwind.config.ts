import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#070612',
          bg2: '#0e0b22',
          surface: '#100d24',
          panel: '#16122e',
          panel2: '#1d1840',
          border: '#2b2552',
          accent: '#8b5cf6',
          accent2: '#a78bfa',
          indigo: '#6366f1',
          cyan: '#22d3ee',
          text: '#f3f2fb',
          muted: '#8d8ab0',
          dim: '#5d5a85',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(139,92,246,0.45)',
        'glow-cyan': '0 0 28px rgba(34,211,238,0.35)',
        card: '0 8px 40px rgba(0,0,0,0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 60s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
