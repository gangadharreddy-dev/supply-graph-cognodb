/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          900: '#1e3a8a',
        },
        node: {
          product: '#2563eb',   // Sapphire Blue
          component: '#7c3aed', // Purple Violet
          material: '#d97706',  // Amber
          supplier: '#059669',  // Emerald
          facility: '#e11d48',  // Rose
        }
      }
    },
  },
  plugins: [],
}
