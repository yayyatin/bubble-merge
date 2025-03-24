/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bubble-blue': '#3B82F6',
        'bubble-pink': '#EC4899',
        'bubble-purple': '#8B5CF6',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.3s ease-in-out',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0) rotate(45deg)' },
          '50%': { transform: 'translateY(-10px) rotate(45deg)' }
        },
      },
    },
  },
  plugins: [],
} 