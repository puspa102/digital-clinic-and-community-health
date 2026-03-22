/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#134e4a",
          900: "#0d3d3a",
        },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "premium-sm": "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
        "premium-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "premium-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.12)",
        "premium-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
        "premium-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
        "glow-teal": "0 0 20px rgba(20, 184, 166, 0.4)",
        "glow-indigo": "0 0 20px rgba(99, 102, 241, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-left": "slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-right": "slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 4s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(20, 184, 166, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};
