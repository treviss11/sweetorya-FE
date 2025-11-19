/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tambahkan baris ini jika belum ada, agar mendeteksi settingan HP
  darkMode: 'media', 
  theme: {
    extend: {},
  },
  plugins: [],
}