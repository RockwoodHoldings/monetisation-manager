import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/roblox": {
        target: "https://apis.roblox.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roblox/, ""),
      },
      "/api/thumbnails": {
        target: "https://thumbnails.roblox.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thumbnails/, ""),
      },
      "/api/games": {
        target: "https://games.roblox.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/games/, ""),
      },
    },
  },
});
