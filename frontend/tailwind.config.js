/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        espresso: {
          950: "#2A1810",
          900: "#3B2318",
          800: "#4A2E1F",
          700: "#5E3A28",
          600: "#7A4E36",
        },
        cream: {
          50: "#FBF6EE",
          100: "#F5EBDA",
          200: "#EBDCC0",
        },
        amber: {
          400: "#D4A24C",
          500: "#C08A2E",
          600: "#A5711F",
        },
        sage: {
          400: "#8FA382",
          500: "#71886A",
        },
        clay: {
          500: "#B8562F",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fabPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(74,46,31,0.35)" },
          "50%": { boxShadow: "0 0 0 14px rgba(74,46,31,0)" },
        },
      },
      animation: {
        marquee: "marquee 9s linear infinite",
        orbit: "orbit 7s linear infinite",
        "bounce-soft": "bounceSoft 1.6s ease-in-out infinite",
        "fab-pulse": "fabPulse 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};
