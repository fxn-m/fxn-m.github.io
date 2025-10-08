import { defineConfig } from "vite"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss()],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    host: true,
    allowedHosts: ["dev.fxn-m.com", "discrete-allegedly-eagle.ngrok-free.app"],
    port: 5173
  }
})
