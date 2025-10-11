import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/quick-post/",
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
