/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          white: '#FFFFFF',
          ivory: '#F8F3E9',
          'ivory-light': '#FDFBF6',
          'text-primary': '#292522',
          'text-secondary': '#777777',
          border: '#EAE6DE',
          gold: '#C6A15B',
          'gold-antique': '#B08D45',
          charcoal: '#292522',
          beige: '#EFE5D5',
        },
        heritage: {
          ivory: '#F8F3E9',
          white: '#FFFFFF',
          gold: '#C6A15B',
          antiqueGold: '#B08D45',
          charcoal: '#292522',
          beige: '#EFE5D5',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.15em',
        'luxury-wide': '0.25em',
      },
      boxShadow: {
        'subtle': '0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'luxury-hover': '0 10px 25px -5px rgba(41, 41, 41, 0.05), 0 8px 10px -6px rgba(41, 41, 41, 0.03)',
        'gold-glow': '0 4px 20px -2px rgba(198, 161, 91, 0.25)',
      }
    },
  },
  plugins: [],
}
