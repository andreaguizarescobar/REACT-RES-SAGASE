/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Gotham Rounded', 'sans-serif'],
        secondary: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
