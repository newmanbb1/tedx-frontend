/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ted: {
          red: '#DA0A2C',
          'red-hover': '#B80825',
          'red-dark': '#8E061D',
          black: '#0A0A0A',
          dark: '#121214',
          charcoal: '#393A3C',
          card: '#161618',
          muted: '#26272A',
          border: '#333438',
          light: '#F4F4F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

