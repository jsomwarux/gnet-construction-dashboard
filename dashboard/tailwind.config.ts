import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*", "./components/**/*", "@/*"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
