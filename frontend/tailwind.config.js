/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Core palette ──
        obsidian:  { DEFAULT: "#0D0D12", 800: "#16161F", 700: "#1E1E2A", 600: "#26263A" },
        saffron:   { DEFAULT: "#C9920A", light: "#E0A80D", dark: "#A07205", muted: "#C9920A20" },
        forest:    { DEFAULT: "#14532D", light: "#166534", dark: "#0F3D21" },
        ivory:     { DEFAULT: "#F7F3ED", warm: "#EDE5D8", cool: "#FAFAF8" },
        coffee:    { DEFAULT: "#5C3317", light: "#7A4422", dark: "#3D210E" },
        // ── Text scale (dark to light) ──
        ink:       { 900: "#0D0D0D", 800: "#1A1A1A", 700: "#2E2E2E", 600: "#4A4A4A", 500: "#6B6B6B", 400: "#8A8A8A", 300: "#ABABAB", 200: "#D0D0D0", 100: "#EBEBEB" },
        // Alias for parchment references already in code
        parchment: { 900: "#0D0D0D", 700: "#2E2E2E", 500: "#6B6B6B", 400: "#8A8A8A", 300: "#ABABAB", 100: "#EBEBEB" },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body:    ["DM Sans", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(2.8rem,7vw,5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl":  ["clamp(2rem,4.5vw,3.5rem)",  { lineHeight: "1.1",  letterSpacing: "-0.015em" }],
        "display-lg":  ["clamp(1.6rem,3.5vw,2.5rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      backgroundImage: {
        "gold-gradient":    "linear-gradient(135deg, #C9920A 0%, #E0A80D 50%, #A07205 100%)",
        "hero-gradient":    "linear-gradient(to bottom, rgba(13,13,18,0.35) 0%, rgba(13,13,18,0.80) 100%)",
        "card-gradient":    "linear-gradient(to top, rgba(13,13,18,0.92) 0%, rgba(13,13,18,0.4) 55%, transparent 100%)",
        "section-gradient": "linear-gradient(180deg, #F7F3ED 0%, #FAF9F7 100%)",
      },
      boxShadow: {
        "gold-glow":  "0 0 28px rgba(201,146,10,0.30), 0 0 56px rgba(201,146,10,0.10)",
        "card-hover": "0 16px 48px rgba(13,13,18,0.14), 0 0 0 1px rgba(201,146,10,0.18)",
        "card-rest":  "0 2px 16px rgba(13,13,18,0.07)",
        "modal":      "0 24px 72px rgba(13,13,18,0.45)",
      },
      animation: {
        "fade-in":    "fadeIn 0.35s ease forwards",
        "fade-up":    "fadeUp 0.5s ease forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "shimmer":    "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeUp:    { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseGold: { "0%,100%": { boxShadow: "0 0 0 0 rgba(201,146,10,0.4)" }, "50%": { boxShadow: "0 0 0 10px rgba(201,146,10,0)" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};


