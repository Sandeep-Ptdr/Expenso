/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/providers/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#ffffff",
          100: "#faf9f6",
          200: "#f5f5f5",
          300: "rgba(0, 0, 0, 0.08)",
        },
        forest: {
          500: "#10b981",
          700: "#059669",
          900: "#047857",
        },
        coral: {
          100: "#fed7aa",
          500: "#f97316",
          700: "#ea580c",
        },
        sky: {
          100: "#dbeafe",
          500: "#3b82f6",
        },
        accent: {
          100: "#f3e8ff",
          500: "#a855f7",
          700: "#ec4899",
        },
        ink: {
          900: "#2d2d2d",
          700: "#6b6b6b",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      boxShadow: {
        card: "0px 10px 24px rgba(0, 0, 0, 0.08)",
        button: "0px 10px 20px rgba(16, 185, 129, 0.18)",
      },
    },
  },
  plugins: [],
};
