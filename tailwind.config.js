/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        source: '#3b82f6',
        transform: '#8b5cf6',
        destination: '#10b981',
      },
    },
  },
  plugins: [],
};


