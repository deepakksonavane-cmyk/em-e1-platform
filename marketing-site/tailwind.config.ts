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
          50: "#f5f5f7",
          100: "#e8e8ed",
          200: "#d2d2d7",
          300: "#a1a1a6",
          400: "#86868b",
          500: "#6e6e73",
          600: "#515154",
          700: "#3a3a3c",
          800: "#2c2c2e",
          900: "#1d1d1f",
          950: "#000000",
        },
        gold: {
          50: "#eef6ff",
          100: "#d6ebff",
          200: "#a8d4ff",
          300: "#6ebeff",
          400: "#2997ff",
          500: "#0071e3",
          600: "#0058b0",
          700: "#004488",
          800: "#003366",
          900: "#001f3f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 16px -4px rgba(0, 0, 0, 0.08)",
      },
      backgroundImage: {
        "navy-gradient":
          "linear-gradient(180deg, #000000 0%, #1d1d1f 100%)",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
export default config;
