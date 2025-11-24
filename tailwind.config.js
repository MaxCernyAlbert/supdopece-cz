/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#f9d7ad',
          300: '#f5ba78',
          400: '#f09442',
          500: '#ec751d',
          600: '#dd5b13',
          700: '#b74412',
          800: '#923617',
          900: '#762f16',
        },
        bread: {
          light: '#f5e6d3',
          medium: '#d4a574',
          dark: '#8b5a2b',
        }
      },
    },
  },
  plugins: [],
}
