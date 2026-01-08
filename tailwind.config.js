/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Madlen Brand Colors - Warm Orange/Amber palette
        madlen: {
          50: '#FFF9F5',
          100: '#FFF3E8',
          200: '#FFE4CC',
          300: '#FFD0A8',
          400: '#FFB36B',
          500: '#D4853C',  // Primary orange from Madlen
          600: '#C27230',
          700: '#A85D24',
          800: '#8B4B1C',
          900: '#6E3A16',
        },
        // Cream/Beige backgrounds
        cream: {
          50: '#FFFCF9',
          100: '#FFF8F2',
          200: '#FFF1E6',
          300: '#FFE8D6',
          400: '#FFDDC2',
        },
        // Dark mode colors
        dark: {
          50: '#374151',
          100: '#2D3748',
          200: '#252D3A',
          300: '#1E2530',
          400: '#171C24',
          500: '#111519',
          600: '#0D1015',
          700: '#090B0E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
