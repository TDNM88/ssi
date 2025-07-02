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
        gray: {
          900: '#1a1a1a',
          800: '#2d2d2d',
          700: '#3f3f3f',
          600: '#525252',
          400: '#a3a3a3',
        },
        teal: {
          400: '#2dd4bf',
          500: '#26a69a',
        },
        green: {
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
          800: '#1e40af',
        },
      },
    },
  },
  plugins: [],
}