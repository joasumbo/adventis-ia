/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adventist: {
          blue: {
            50: '#e6f2ff',
            100: '#b3d9ff',
            200: '#80c0ff',
            300: '#4da7ff',
            400: '#1a8eff',
            500: '#005A9C',
            600: '#004d85',
            700: '#00406e',
            800: '#003357',
            900: '#002640',
          },
          red: {
            50: '#ffe6ec',
            100: '#ffb3c5',
            200: '#ff809e',
            300: '#ff4d77',
            400: '#ff1a50',
            500: '#C8102E',
            600: '#a80d26',
            700: '#880a1e',
            800: '#680816',
            900: '#48050e',
          },
          gold: {
            50: '#fef9e7',
            100: '#fcefc0',
            200: '#fae599',
            300: '#f8db72',
            400: '#f6d14b',
            500: '#B8860B',
            600: '#9a7009',
            700: '#7c5a07',
            800: '#5e4405',
            900: '#402e03',
          },
          beige: {
            50: '#fefefe',
            100: '#fdfcfb',
            200: '#fcfaf7',
            300: '#fbf8f3',
            400: '#faf6ef',
            500: '#F5F5DC',
            600: '#d4d4bc',
            700: '#b3b39c',
            800: '#92927c',
            900: '#71715c',
          }
        }
      },
      animation: {
        'typing': 'typing 1.5s steps(3, end) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}