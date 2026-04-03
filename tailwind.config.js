/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9",
        secondary: "#6366F1",
        accent: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        background: {
          DEFAULT: "#0A0F1E",
          card: "#111827",
        },
        text: {
          primary: "#F9FAFB",
          muted: "#6B7280",
        }
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
