/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0A192F",
          800: "#0F2744",
          700: "#1E3A5F",
          600: "#2B4C7E",
        },
        health: {
          blue: "#1E56A0",
          sky: "#0284C7",
          teal: "#0D9488",
          emerald: "#059669",
          amber: "#D97706",
          rose: "#E11D48",
          light: "#F8FAFC"
        }
      }
    },
  },
  plugins: [],
}
