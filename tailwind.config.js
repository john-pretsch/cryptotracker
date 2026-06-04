/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.jsx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gecko: {
          green: '#8dc647',
          blue: '#4f46e5',
        },
      },
    },
  },
  plugins: [],
};
