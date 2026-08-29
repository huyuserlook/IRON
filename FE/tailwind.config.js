/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
      colors: {
        iron: {
          red: "#94000D",
          accent: "#C91B1B",
          yellow: "#FFEB00",
          dark: "#24282B",
        },
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-bike": {
          "0%": { opacity: "0", transform: "translateX(48px) scale(0.94)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "brand-in": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "hero-slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(80px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "hero-slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-80px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "hero-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "hero-counter-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-bike": "slide-bike 0.75s cubic-bezier(0.22, 1, 0.36, 1) both",
        "brand-in": "brand-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 4s ease-in-out infinite",
        "hero-slide-in-right": "hero-slide-in-right 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) both",
        "hero-slide-in-left": "hero-slide-in-left 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) both",
        "hero-fade-in": "hero-fade-in 0.55s ease-out both",
        "hero-counter-fade": "hero-counter-fade 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
