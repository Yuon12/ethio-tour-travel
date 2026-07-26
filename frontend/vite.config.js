export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Ethiopia Tour & Travel Design Tokens ──
        // Deep obsidian — hero, footer backgrounds
        obsidian:  { DEFAULT: "#0A0A0F", 800: "#12121A", 700: "#1C1C28" },
        // Ethiopian coffee brown — warmth, accents
        coffee:    { DEFAULT: "#6B3A2A", light: "#8B5444", dark: "#4A2518" },
        // Saffron gold — primary brand accent
        saffron:   { DEFAULT: "#D4A017", light: "#E8C042", dark: "#A07810", muted: "#D4A01720" },
        // Forest green — calls to action
        forest:    { DEFAULT: "#1A5C38", light: "#236B44", dark: "#134428" },
        // Warm ivory — page backgrounds, cards
        ivory:     { DEFAULT: "#F5F0E8", warm: "#EDE5D8", cool: "#FAF8F5" },
        // Parchment text tones
        parchment: { 900: "#1A1208", 700: "#4A3820", 500: "#7A6448", 300: "#B8A888", 100: "#E8E0D0" },
      },
      fontFamily: {
        // Cormorant Garamond — ultra-elegant, historical, editorial
        display: ["Cormorant Garamond", "Georgia", "serif"],
        // DM Sans — clean, modern, highly legible
        body:    ["DM Sans", "system-ui", "sans-serif"],
        // Mono for booking references
        mono:    ["JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem,8vw,6rem)",   { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl":  ["clamp(2.25rem,5vw,4rem)", { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-lg":  ["clamp(1.75rem,4vw,3rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      backgroundImage: {
        "gold-gradient":   "linear-gradient(135deg, #D4A017 0%, #E8C042 50%, #A07810 100%)",
        "hero-gradient":   "linear-gradient(to bottom, rgba(10,10,15,0.2) 0%, rgba(10,10,15,0.85) 100%)",
        "card-gradient":   "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.3) 60%, transparent 100%)",
        "section-gradient":"linear-gradient(180deg, #F5F0E8 0%, #FAF8F5 100%)",
      },
      boxShadow: {
        "gold-glow":  "0 0 30px rgba(212,160,23,0.25), 0 0 60px rgba(212,160,23,0.1)",
        "card-hover": "0 20px 60px rgba(10,10,15,0.15), 0 0 0 1px rgba(212,160,23,0.2)",
        "card-rest":  "0 4px 20px rgba(10,10,15,0.08)",
        "modal":      "0 25px 80px rgba(10,10,15,0.4)",
      },
      animation: {
        "fade-up":      "fadeUp 0.6s ease forwards",
        "fade-in":      "fadeIn 0.4s ease forwards",
        "shimmer":      "shimmer 2s linear infinite",
        "float":        "float 6s ease-in-out infinite",
        "pulse-gold":   "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float:     { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        pulseGold: { "0%,100%": { boxShadow: "0 0 0 0 rgba(212,160,23,0.4)" }, "50%": { boxShadow: "0 0 0 12px rgba(212,160,23,0)" } },
      },
    },
  },
  plugins: [],
};


