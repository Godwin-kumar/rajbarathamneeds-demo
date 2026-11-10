/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        erp: {
          sidebar: '#F8F1E5',
          workspace: '#FFFFFF',
          header: '#FFFFFF',
          card: '#FFFFFF',
          text: '#000000',
          'text-secondary': '#333333',
          gold: '#C99A35',
          'gold-hover': '#B88928',
          'active-menu': '#F6E2B5',
          border: '#EFE5D5',
          hover: '#F3EBDD',
          ivory: '#F8F1E5',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
