import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Базовий шлях задає збірка на GitHub Actions (--base), тож перейменування
// репозиторію чи власний домен не вимагають змін у коді.
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Трафарет силянки",
        short_name: "Силянка",
        description: "Трафарети для силянок: розфарбовування бісерин, підрахунок бісеру й друк.",
        lang: "uk",
        dir: "ltr",
        display: "standalone",
        start_url: ".",
        scope: ".",
        background_color: "#F1F2EE",
        theme_color: "#2B45A6",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html"
      }
    })
  ]
});
