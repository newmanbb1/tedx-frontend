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
          red: '#EB0028',
          'red-hover': '#CC0023',
          'red-dark': '#A3001C',
          black: '#0D0D0D',
          dark: '#141414',
          card: '#1F1F1F',
          muted: '#2A2A2A',
          border: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

