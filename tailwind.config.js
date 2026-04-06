/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#F7F6F2',
          50: '#FDFCFA',
          100: '#F2F1EC',
          200: '#E8E6DE',
          300: '#D6D2C6',
          400: '#B8B4A4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          border: '#E4E1D7',
          hover: '#F7F6F2',
        },
        dark: {
          bg:       '#0E0F11',
          surface:  '#16181C',
          elevated: '#1E2027',
          border:   '#2A2D35',
          hover:    '#232630',
        },
        accent: {
          DEFAULT: '#4F7FFF',
          dim:     '#3B6EFF',
          glow:    '#6B97FF',
          muted:   'rgba(79,127,255,0.10)',
          soft:    'rgba(79,127,255,0.18)',
        },
        emerald: {
          accent: '#00C896',
          dim:    '#00A87E',
          muted:  'rgba(0,200,150,0.10)',
        },
        ink: {
          primary:   '#141416',
          secondary: '#4E4D47',
          muted:     '#9E9C94',
          code:      '#374151',
          link:      '#4F7FFF',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow':            '0 0 0 3px rgba(79,127,255,0.20)',
        'glow-green':      '0 0 0 3px rgba(0,200,150,0.20)',
        'card':            '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover':      '0 4px 16px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.06)',
        'card-dark':       '0 1px 3px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.20)',
        'card-dark-hover': '0 4px 20px rgba(0,0,0,0.45), 0 8px 40px rgba(0,0,0,0.25)',
        'button':          '0 1px 2px rgba(0,0,0,0.10)',
        'button-glow':     '0 4px 14px rgba(79,127,255,0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,127,255,0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(79,127,255,0.30)' },
        },
      },
    },
  },
  plugins: [],
}