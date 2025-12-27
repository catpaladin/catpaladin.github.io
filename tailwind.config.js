/** @type {import('tailwindcss').Config} */
export default {
  content: ['./layouts/**/*.html', './content/**/*.md', './src/**/*.{svelte,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B0FF', // Your Go-blue
          dark: '#0081CB'
        },
        dark: {
          DEFAULT: '#1a1a1a',
          lighter: '#242424'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
