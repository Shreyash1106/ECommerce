/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gray: {
          950: "#0a0a0f",
          900: "#111118", 
          800: "#1a1a24",
          700: "#252534",
          600: "#3a3a4e",
          500: "#6b6b84",
          400: "#9494a8",
          300: "#c2c2cf",
          200: "#e0e0e6",
          100: "#f2f2f5",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.25s ease-out",
      },
      keyframes: {
        fadeIn: { 
          "0%": { opacity: "0" }, 
          "100%": { opacity: "1" } 
        },
        slideIn: { 
          "0%": { opacity: "0", transform: "translateY(-8px)" }, 
          "100%": { opacity: "1", transform: "translateY(0)" } 
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};