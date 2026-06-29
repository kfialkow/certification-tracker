/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202b",
        line: "#d8dde6",
        canvas: "#f5f7fa",
        panel: "#ffffff",
        action: "#1662d4",
        success: "#16815d",
        warn: "#a45c00",
        danger: "#b42318"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(24, 32, 43, 0.08)"
      }
    }
  },
  plugins: []
};
