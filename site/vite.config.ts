import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served from https://praticon.github.io/praticon-glyphs/
export default defineConfig({
  base: "/praticon-glyphs/",
  plugins: [react()],
});
