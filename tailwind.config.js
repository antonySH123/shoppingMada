/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      animation: {
        'translate-y': 'translateY 1s ease-out', // Définition de l'animation
      },
      keyframes: {
        translateY: {
          '0%': { transform: 'translateY(-70px)' }, // Point de départ
          '100%': { transform: 'translateY(0)' },   // Point d'arrivée
        },
      },
    },
  },
  plugins: [],
}