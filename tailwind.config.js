/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '20px', sm: '24px', lg: '32px', xl: '40px' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        forest: {
          DEFAULT: '#173D32',
          950: '#0F2A23',
          900: '#173D32',
          800: '#1E4C3F',
        },
        moss: {
          DEFAULT: '#34745B',
          600: '#2C6450',
          700: '#26604C',
        },
        sage: '#83A88B',
        cream: '#F6F5F0',
        sand: '#EDEADF',
        clay: { DEFAULT: '#E69A4A', soft: '#F3D3AC' },
        ink: '#26342D',
        muted: '#7A857D',
        line: '#DFDBCE',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"SF Mono"', '"Cascadia Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.06em' }],
        display: ['clamp(2.5rem, 5.2vw, 4.5rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(2rem, 3.4vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        'section': ['clamp(1.65rem, 2.5vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,61,50,0.04), 0 8px 24px -12px rgba(23,61,50,0.10)',
        lift: '0 2px 6px rgba(23,61,50,0.06), 0 22px 48px -22px rgba(23,61,50,0.24)',
        float: '0 24px 60px -28px rgba(23,61,50,0.32)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.5)',
      },
      borderRadius: {
        card: '16px',
        panel: '22px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97) translateY(6px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-480px 0' },
          '100%': { backgroundPosition: '480px 0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(18px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
