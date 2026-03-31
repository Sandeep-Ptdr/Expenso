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
          50: "#f9f6f0",
          100: "#f4efe6",
          200: "#e8dfd1",
          300: "#d8c8b2",
        },
        forest: {
          500: "#1f6f5f",
          700: "#174d42",
          900: "#102f29",
        },
        coral: {
          500: "#d05f4b",
        },
        ink: {
          900: "#161616",
          700: "#5f5c57",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      boxShadow: {
        card: "0px 10px 30px rgba(23, 77, 66, 0.10)",
      },
    },
  },
  plugins: [],
};
