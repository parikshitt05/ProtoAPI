/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16,185,129,0.08)",
          border: "rgba(16,185,129,0.2)",
          ring: "rgba(16,185,129,0.45)",
          glow: "rgba(16,185,129,0.25)",
        },
        amber: {
          accent: "#F59E0B",
          muted: "rgba(245,158,11,0.08)",
          border: "rgba(245,158,11,0.2)",
        },
        coral: {
          accent: "#FF6B6B",
          muted: "rgba(255,107,107,0.08)",
          border: "rgba(255,107,107,0.2)",
        },
        surface: {
          base: "#0F1115",
          card: "#171A21",
          elevated: "#1E222B",
        },
        line: {
          DEFAULT: "#2A2F3A",
          hover: "#374151",
        },
        tx: {
          primary: "#F3F4F6",
          secondary: "#9CA3AF",
          muted: "#6B7280",
          ghost: "#4B5563",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        sans: ["'Geist'", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 24px 64px rgba(0,0,0,0.3)",
        brand: "0 8px 24px rgba(16,185,129,0.25)",
        deep: "0 16px 40px rgba(0,0,0,0.2)",
      },
      keyframes: {
        pulsedot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
      animation: {
        pulsedot: "pulsedot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
