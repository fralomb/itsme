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
        'card-light': 'var(--color-card-light)',
        'card-dark': 'var(--color-card-dark)',
        'border-light': 'var(--color-border-light)',
        'border-dark': 'var(--color-border-dark)',
        'muted-light': 'var(--color-muted-light)',
        'muted-dark': 'var(--color-muted-dark)',
        'bg-tint-light': 'var(--color-bg-tint-light)',
        'bg-tint-dark': 'var(--color-bg-tint-dark)',
        'ok-light': 'var(--color-ok-light)',
        'ok-dark': 'var(--color-ok-dark)',
        'bad-light': 'var(--color-bad-light)',
        'bad-dark': 'var(--color-bad-dark)',
      }
    }
  },
  plugins: [],
}

