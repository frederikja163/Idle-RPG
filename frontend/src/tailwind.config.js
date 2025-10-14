const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./frontend/src/**/*.{html,js,ts,jsx,tsx}', './frontend/src/index.html'],
  theme: {
    extend: {
      colors: {
        primary: colors.red,
      },
    },
  },
  plugins: [],
};
