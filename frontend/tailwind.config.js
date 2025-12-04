/** @type {import('tailwindcss').Config} */
export default {
  // Escanea todos los archivos JSX y TSX en src/
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}