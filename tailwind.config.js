/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f4", 100: "#dcefe3", 200: "#b9dfc8", 500: "#2f8a57",
          600: "#23704a", 700: "#1c5a3c", 800: "#164530", 900: "#0f2f21",
        },
        warm: { 50: "#fdf8f1", 100: "#f8ebd6", 400: "#e0a052", 500: "#c9822f", 700: "#8a5418" },
        ink: "#1f2a24",
      },
      fontFamily: {
        sans: ["Atkinson Hyperlegible", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
