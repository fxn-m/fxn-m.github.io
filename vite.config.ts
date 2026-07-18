import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  server: {
    allowedHosts: ["dev.fxn-m.com"],
  },
});
