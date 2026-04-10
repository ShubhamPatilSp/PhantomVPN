/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        phantom: {
          bg: '#050508',
          surface: '#0A0A0F',
          card: '#0F0F16',
          border: 'rgba(255,255,255,0.06)',
          accent: '#C8FF00',
          cyan: '#00E5FF',
          red: '#FF3B5C',
          success: '#00FF88',
          warning: '#FFB347',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
