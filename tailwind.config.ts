import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        accent: {
          DEFAULT: "#0f766e",
          bright: "#14b8a6",
          warm: "#f97316"
        }
      },
      boxShadow: {
        float: "0 24px 60px rgba(15, 23, 42, 0.12)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(20,184,166,0.22), transparent 28%), radial-gradient(circle at top right, rgba(249,115,22,0.18), transparent 24%), linear-gradient(135deg, #f8fafc 0%, #ecfeff 55%, #fff7ed 100%)"
      }
    }
  },
  plugins: []
};

export default config;
