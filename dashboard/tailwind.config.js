/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        outfit: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        workflow: {
          success: "rgb(var(--wf-success-rgb) / <alpha-value>)",
          running: "rgb(var(--wf-running-rgb) / <alpha-value>)",
          warning: "rgb(var(--wf-warning-rgb) / <alpha-value>)",
          error: "rgb(var(--wf-error-rgb) / <alpha-value>)",
          ai: "rgb(var(--wf-ai-rgb) / <alpha-value>)",
          pending: "rgb(var(--wf-pending-rgb) / <alpha-value>)",
        },
        cyber: {
          dark: "#0a0a0c", // Deeper, flatter dark for background
          card: "#101012", // Slightly elevated flat charcoal
          "card-border": "#ffffff0a", // Ultra subtle 4% white border
          primary: "#ffffff", // Pure white
          secondary: "#a1a1aa", // Clean silver gray (zinc-400)
          accent: "#38bdf8", // Smart modern sky blue accent
          "text-primary": "#fafafa", // Bright crisp zinc-50
          "text-secondary": "#a1a1aa", // Muted zinc-400
          "text-muted": "#71717a", // Muted zinc-500
        },
      },
    },
  },
  plugins: [],
};
