import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "24px",
      },
      screens: {
        DEFAULT: "1488px", // 1440px + 24px padding on each side
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        body: "var(--font-geist-sans)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    function ({
      addComponents,
    }: {
      addComponents: (components: object) => void;
    }) {
      addComponents({
        ".container-nav": {
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "1488px",
        },
      });
    },
  ],
};
export default config;
