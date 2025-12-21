/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./main.js",
  ],
  theme: {
    extend: {
      colors: {
        'placement-blue': '#1e3a8a', // Deep blue for professional look
        'placement-light': '#f3f4f6', // Light gray background
      }
    },
  },
  plugins: [],
}
