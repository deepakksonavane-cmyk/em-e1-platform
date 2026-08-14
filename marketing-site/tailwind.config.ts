import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: "#eef1f6",
          100: "#d4dbe8",
          200: "#a9b7d1",
          300: "#7e93ba",
          400: "#4f6699",
          500: "#2d4373",
          600: "#1f2f57",
          700: "#162244",
          800: "#0f1830",
          900: "#0a1122",
          950: "#060b17",
        },
        gold: {
          50: "#fdf8ec",
          100: "#faedc9",
          200: "#f5db93",
          300: "#efc45c",
          400: "#e8ac33",
          500: "#d4941f",
          600: "#b17317",
          700: "#8a5717",
          800: "#714619",
          900: "#5f3a19",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(10, 17, 34, 0.15)",
      },
      backgroundImage: {
        "navy-gradient":
          "linear-gradient(135deg, #0a1122 0%, #162244 55%, #2d4373 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
