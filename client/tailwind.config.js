/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mac-dark': '#1d1d1f',
        'mac-gray': '#86868b',
        'mac-blue': '#0071e3',
        'mac-green': '#34c759',
        'mac-red': '#ff3b30',
        'mac-orange': '#ff9500',
        'mac-yellow': '#ffcc00',
        'mac-purple': '#af52de',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
