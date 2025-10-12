import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGitHub = process.env.BUILD_TARGET === "ghpages";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHub ? "/quick-post/" : "./",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        background: "public/background.js",
      },
    },
    copyPublicDir: true,
  },
});
