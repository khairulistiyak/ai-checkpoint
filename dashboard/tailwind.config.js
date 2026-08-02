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
          dark: "#09090b",           // Apple/Linear Studio Matte Black
          card: "#121214",           // Minimalist Dark Charcoal Card
          "card-border": "#ffffff14",// Subtle 8% white border
          primary: "#ffffff",        // Pure white
          secondary: "#a1a1aa",      // Clean silver gray (zinc-400)
          accent: "#ffffff",         // Clean monochrome white accent
          "text-primary": "#f4f4f5", // Bright crisp zinc-100
          "text-secondary": "#a1a1aa",// Muted zinc-400
          "text-muted": "#71717a",   // Muted zinc-500
        }
      }
    },
  },
  plugins: [],
}
