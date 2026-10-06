import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served from https://praticon.github.io/praticon-glyphs/
export default defineConfig({
  base: "/praticon-glyphs/",
  plugins: [react()],
  // Bundle the workspace packages into the SSR build so the pre-render step
  // can run it in plain Node (they import JSON, which Node needs flagged).
  ssr: { noExternal: [/^@praticon-glyphs\//] },
});
