import "./main.css"

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { VueQueryPlugin } from "@tanstack/vue-query"
import { createApp } from "vue"

import App from "./client/App.vue"
import { registerIcons } from "./client/config/icons"
import { queryClient } from "./client/config/query"
import router from "./client/router"

// Initialize Font Awesome icons
registerIcons()

// Create and configure Vue app
const app = createApp(App)

// Register plugins
app.use(VueQueryPlugin, { queryClient })
app.use(router)
app.component("font-awesome-icon", FontAwesomeIcon)

app.mount("#app")
