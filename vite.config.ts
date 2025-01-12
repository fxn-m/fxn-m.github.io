import { defineConfig } from "vite"
import path from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), vueJsx()],
    define: {
        __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
})
