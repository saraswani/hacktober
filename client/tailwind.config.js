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
        slate: {
          850: '#151d2e',
          900: '#0f172a',
          950: '#080d1a'
        },
        jury: {
          skeptic: '#f43f5e',
          expert: '#f59e0b',
          beginner: '#0ea5e9',
          verifier: '#10b981',
          consensus: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
