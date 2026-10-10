/** @type {import('tailwindcss').Config} */
// TogetherWeGrow design tokens.
// brand = forest/sage greens, warm = ivory/gold/terracotta, ink = charcoal text, muted = gray-green secondary text.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F2F6F3",
          100: "#E4EDE5", // soft sage
          200: "#CADBCF",
          300: "#A6C0AE",
          500: "#4C7461",
          600: "#335B4A",
          700: "#234638", // deep forest: primary
          800: "#1B382C",
          900: "#142B21",
        },
        warm: {
          50: "#FAF8F3", // warm ivory: page background
          100: "#F3ECDF",
          200: "#E8D9BF",
          400: "#D8AB67", // golden accent
          500: "#C97758", // terracotta (decorative / large text only)
          600: "#A4553A", // terracotta for buttons and text (AA on white & ivory)
          700: "#8A4630",
          800: "#6B3624",
          900: "#4E281B",
        },
        ink: "#25312C",
        muted: "#5F6C64",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Fraunces", "Georgia", "Cambria", "serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};
