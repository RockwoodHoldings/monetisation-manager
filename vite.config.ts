import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
