/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#FAFAF9',
          100: '#E7E5E4',
        },
        amber: {
          10: '#FCF8F0',
          50: '#FFFBEB',
          400: '#FACC15',
          900: '#422006'
        },
        slate: {
          900: '#082F49',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
