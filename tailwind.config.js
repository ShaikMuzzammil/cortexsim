/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05060a",
        panel: "#0b0e16",
        brand: {
          cyan: "#22d3ee",
          violet: "#a855f7",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s ease infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
