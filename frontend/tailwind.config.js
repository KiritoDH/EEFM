/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B19',
          900: '#0B132B',
          800: '#1C2541',
          700: '#273454',
          600: '#3A506B',
          500: '#4F6D8F',
          100: '#E8ECF5',
          50: '#F4F6FB'
        },
        brand: {
          teal: '#06D6A0',
          emerald: '#10B981',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          rose: '#F43F5E',
          indigo: '#6366F1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
