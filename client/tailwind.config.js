/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1915",
        muted: "#6E665C",
        paper: "#F3EEE6",
        card: "#FFFBF6",
        line: "#E6D9C8",
        forest: {
          DEFAULT: "#0E6B52",
          deep: "#08382C",
          soft: "#E4F3EC",
        },
        clay: "#C94B2A",
        amber: "#C4841D",
        gold: "#F6E2C4",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 18px 40px -28px rgba(58, 36, 18, 0.45)",
      },
    },
  },
  plugins: [],
};
