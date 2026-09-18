/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'blue-black': '#000428',   // أزرق داكن مائل للسواد
      },
      backgroundImage: {
        'dark-gradient':
          'linear-gradient(to top left, #581c87, #1e1b4b, #000428)', // purple-900, indigo-950, blue-black
      },
    },
  },
  plugins: [],
}
