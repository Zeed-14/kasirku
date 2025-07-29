/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // ... (biarkan keyframes 'slide-up' yang sudah ada)
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        // --- TAMBAHKAN DUA KEYFRAMES INI ---
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'add-to-cart-anim': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.5)', opacity: 0 },
        }
      },
      animation: {
        // ... (biarkan animasi 'slide-up' yang sudah ada)
        'slide-up': 'slide-up 0.3s ease-out forwards',
        // --- TAMBAHKAN DUA ANIMASI INI ---
        shake: 'shake 0.5s ease-in-out',
        'add-to-cart': 'add-to-cart-anim 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
