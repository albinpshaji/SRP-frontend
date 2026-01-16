/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        secondary: '#FFF8F0', // This fixes the 'bg-secondary' error
        dark: '#333333',      // This fixes the 'text-dark' error
      },
    },
  },
  plugins: [],
}