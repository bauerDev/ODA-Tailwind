import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#661414",
          foreground: "#F5F5F5",
        },
        background: "#F5F5F5",
        foreground: "#1A1A1A",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        muted: {
          DEFAULT: "#E8E8E8",
          foreground: "#4A4A4A",
        },
        border: "#AFAFAF",
        secondary: "#F5F0E8",
      },
      fontFamily: {
        base: ["Georgia", "Times New Roman", "serif"],
        heading: ["EB Garamond", "Georgia", "serif"],
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "4xl": "5rem",
        "5xl": "6rem",
        "6xl": "8rem",
      },
    },
  },
  plugins: [],
};

export default config;
