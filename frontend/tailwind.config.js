/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme — Microsoft Fluent
        ms: {
          blue:     "#0078D4",
          bluedark: "#005A9E",
          gray:     "#F3F2F1",
          dark:     "#201F1E",
          neutral:  "#605E5C",
          border:   "#EDEBE9",
          bg:       "#FAF9F8",
          surface:  "#FFFFFF",
        },
        // Dark theme — Deep navy
        navy: {
          950:  "#030712",
          900:  "#0a0f1e",
          800:  "#0f172a",
          700:  "#1e293b",
          600:  "#334155",
          500:  "#475569",
          400:  "#64748b",
          300:  "#94a3b8",
          200:  "#cbd5e1",
          100:  "#e2e8f0",
        },
        risk: {
          high:   "#DC2626",
          medium: "#D97706",
          low:    "#16A34A",
        },
        accent: "#0078D4",
      },
      fontFamily: {
        sans: ['"Segoe UI"', "system-ui", "sans-serif"],
        mono: ['"Cascadia Code"', '"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        fluent:    "0 1.6px 3.6px rgba(0,0,0,.13), 0 .3px .9px rgba(0,0,0,.11)",
        "fluent-md":"0 3.2px 7.2px rgba(0,0,0,.13), 0 .6px 1.8px rgba(0,0,0,.11)",
        "fluent-lg":"0 6.4px 14.4px rgba(0,0,0,.13), 0 1.2px 3.6px rgba(0,0,0,.11)",
        "dark-sm": "0 1px 3px rgba(0,0,0,.4)",
        "dark-md": "0 4px 12px rgba(0,0,0,.4)",
      },
      borderRadius: { fluent: "4px" },
    },
  },
  plugins: [],
};