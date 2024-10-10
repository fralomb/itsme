const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fira Code"', ...defaultTheme.fontFamily.sans],
        poppins: ["Poppins", "sans-serif"],
        fira: ["Fira Code", "monospace"],
        sign: ["Babylonica", "cursive"],
      },
      colors: {
        'main-light-hover': 'var(--color-secondary-light-hover)',
        'main-dark-hover': 'var(--color-secondary-dark-hover)',
        'main-light': 'var(--color-secondary-light)',
        'main-dark': 'var(--color-secondary-dark)',
        'bg-light': 'var(--color-primary-light)',
        'bg-dark': 'var(--color-primary-dark)',
        'highlight-light': 'var(--color-accent-light)',
        'highlight-dark': 'var(--color-accent-dark)',
      }
    }
  },
  plugins: [],
}

