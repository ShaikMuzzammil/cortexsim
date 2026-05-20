import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0F",
        violetSlate: "#1A1A2E",
        midnight: "#16213E",
        neon: "#00F0FF",
        electric: "#9D4EDD",
        softWhite: "#E0E0E0",
        lavenderGray: "#8A8A9A",
        synapticGreen: "#00E676",
        spikeRed: "#FF1744",
        amberAP: "#FF9100",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      boxShadow: {
        neon: "0 0 15px #00F0FF",
        "neon-lg": "0 0 30px #00F0FF",
        electric: "0 0 15px #9D4EDD",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glitch": "glitch 1s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 15px #00F0FF" },
          "50%": { opacity: "0.7", boxShadow: "0 0 25px #00F0FF" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;