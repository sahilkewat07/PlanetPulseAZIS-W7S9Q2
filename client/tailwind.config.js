/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pp: {
          bg: 'var(--color-bg)',
          ink: 'var(--color-ink)',
          primary: 'var(--color-primary)',
          accent: 'var(--color-accent)',
          warning: 'var(--color-warning)',
          border: 'var(--color-border)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
