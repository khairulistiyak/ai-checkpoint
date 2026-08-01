/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        cyber: {
          dark: "#08090a",
          card: "#0d0e12",
          "card-border": "#ffffff0d", // 5% white
          primary: "#ffffff",
          secondary: "#a1a1aa",
          accent: "#00f0ff", // Neon Cyan
          "text-primary": "#f3f4f6",
          "text-secondary": "#a1a1aa",
          "text-muted": "#52525b",
        }
      }
    },
  },
  plugins: [],
}
