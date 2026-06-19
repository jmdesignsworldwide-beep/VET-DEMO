import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand tokens (constant across themes) ──
        brand: {
          DEFAULT: "#14B8A6", // turquesa primario
          glow: "#2DD4BF",
        },
        accent: {
          DEFAULT: "#FB7185", // coral cálido
          glow: "#FDA4AF",
        },
        // ── Semantic surfaces (driven by CSS vars → theme-aware) ──
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        hairline: "rgb(var(--hairline) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(45 212 191 / 0.25), 0 8px 30px -8px rgb(20 184 166 / 0.45)",
        "glow-accent":
          "0 0 0 1px rgb(253 164 169 / 0.25), 0 8px 30px -8px rgb(251 113 133 / 0.45)",
        glass:
          "0 1px 0 0 rgb(255 255 255 / 0.06) inset, 0 10px 40px -12px rgb(0 0 0 / 0.55)",
        "glass-light":
          "0 1px 0 0 rgb(255 255 255 / 0.7) inset, 0 18px 50px -20px rgb(20 30 50 / 0.18)",
        lift: "0 24px 60px -24px rgb(0 0 0 / 0.5)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "aurora-one": {
          "0%, 100%": { transform: "translate(-8%, -6%) scale(1)" },
          "50%": { transform: "translate(6%, 8%) scale(1.18)" },
        },
        "aurora-two": {
          "0%, 100%": { transform: "translate(10%, 4%) scale(1.1)" },
          "50%": { transform: "translate(-6%, -10%) scale(1)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.85" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "aurora-one": "aurora-one 18s ease-in-out infinite",
        "aurora-two": "aurora-two 22s ease-in-out infinite",
        breathe: "breathe 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
