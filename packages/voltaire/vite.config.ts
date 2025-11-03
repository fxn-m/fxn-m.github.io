import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: 4173
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    manifest: "manifest.json",
    rollupOptions: {
      input: path.resolve(__dirname, "src/main.tsx"),
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
})
