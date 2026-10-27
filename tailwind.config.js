/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        black: "#000000",
        gray: {
          50: "rgb(var(--muted-surface-rgb) / <alpha-value>)",
          100: "rgb(var(--muted-surface-rgb) / <alpha-value>)",
          200: "rgb(var(--border-rgb) / <alpha-value>)",
          300: "rgb(var(--border-rgb) / <alpha-value>)",
          400: "rgb(var(--muted-rgb) / <alpha-value>)",
          500: "rgb(var(--muted-rgb) / <alpha-value>)",
          600: "rgb(var(--muted-rgb) / <alpha-value>)",
          700: "rgb(var(--foreground-rgb) / <alpha-value>)",
          800: "rgb(var(--foreground-rgb) / <alpha-value>)",
          900: "rgb(var(--foreground-rgb) / <alpha-value>)",
          950: "rgb(var(--foreground-rgb) / <alpha-value>)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        muted: "var(--muted)",
        "muted-surface": "var(--muted-surface)",
        input: "var(--input)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
      },
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
