/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        phantom: {
          bg: '#080B14',
          card: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
          primary: '#6C63FF',
          secondary: '#00D4FF',
          accent: '#FF6B6B',
          success: '#00FF88',
          warning: '#FFB347',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C63FF, #00D4FF)',
        'gradient-dark': 'linear-gradient(135deg, #080B14, #0d1117)',
        'gradient-card': 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108,99,255,0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(108,99,255,0.8), 0 0 60px rgba(0,212,255,0.3)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
