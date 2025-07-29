/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up': { 
          '0%': { transform: 'translateY(100%)' }, 
          '100%': { transform: 'translateY(0)' } 
        },
        shake: { 
          '0%, 100%': { transform: 'translateX(0)' }, 
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' }, 
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' } 
        },
        'add-to-cart-anim': { 
          '0%': { transform: 'scale(1)', opacity: 1 }, 
          '100%': { transform: 'scale(0.5)', opacity: 0 } 
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        // --- Animasi Laser yang sudah diperbaiki posisinya ---
        'scan-laser': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(250px)' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out forwards',
        shake: 'shake 0.5s ease-in-out',
        'add-to-cart': 'add-to-cart-anim 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        // --- Animasi Laser yang sudah diperbaiki posisinya ---
        'scan-laser': 'scan-laser 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
