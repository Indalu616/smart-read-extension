// vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // --- ADD THIS SECTION TO FIX THE ERROR ---
  // This forces Vite to use a single instance of these core libraries,
  // preventing the "Invalid hook call" error.
  resolve: {
    dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
  },
});
