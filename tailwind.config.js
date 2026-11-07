/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#000000',
          bgAlt: '#050d08',
          panel: '#0a1410',
          border: '#0f2a1f',
          borderBright: '#1a4d38',
          accent: '#00ff88',
          accentDim: '#00cc6a',
          accentGlow: 'rgba(0, 255, 136, 0.25)',
          text: '#b8ffdb',
          textDim: '#5a9980',
          textMute: '#2e5a48',
          danger: '#ff4466',
          warn: '#ffaa00',
        },
      },
      fontFamily: {
        sans: [
          'JetBrains Mono',
          'Orbitron',
          'ui-monospace',
          'monospace',
          'PingFang SC',
          'Microsoft YaHei',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
        display: [
          'Orbitron',
          'JetBrains Mono',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 12px rgba(0,255,136,0.35), 0 0 24px rgba(0,255,136,0.15)',
        glowSoft: '0 0 8px rgba(0,255,136,0.2)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,255,136,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0,255,136,0.7)' },
        },
      },
      animation: {
        flicker: 'flicker 3s infinite',
        scanline: 'scanline 8s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
