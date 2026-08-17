import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#5865f2",
          600: "#4752c4",
        },
        surface: {
          950: "#0f172a",
          900: "#1e293b",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
          400: "#94a3b8",
        },
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
