/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ab3600',
          container: '#ff5f1f',
          fixed: '#ffdbcf',
        },
        surface: {
          DEFAULT: '#f9f9f9',
          lowest: '#ffffff',
          low: '#f3f3f3',
          highest: '#e2e2e2',
        },
        on: {
          surface: '#1a1c1c',
          background: '#1a1c1c',
        }
      },
      fontFamily: {
        epilogue: ['Epilogue', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      spacing: {
        16: '5.5rem',
        20: '7rem',
      }
    },
  },
  plugins: [],
}
