/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8fafc',
        ink: '#1d2a34',
        muted: '#5f6f7d',
        border: '#dde5ee',
        borderStrong: '#9eb1bf',
        primary: '#f78f1f',
        danger: '#b0392f',
        success: '#17734a',
      },
      fontFamily: {
        body: ['"Be Vietnam Pro"', 'Segoe UI', 'sans-serif'],
        heading: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 14px 30px rgba(31, 41, 51, 0.12)',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(180deg, #f6f8fc 0%, #f2f5f9 100%)',
      },
    },
  },
  plugins: [],
}