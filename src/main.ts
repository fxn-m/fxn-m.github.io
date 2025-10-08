import "./main.css"

import {
  faArrowLeft,
  faArrowsRotate,
  faCaretLeft,
  faCircleQuestion,
  faEnvelope,
  faFlagCheckered,
  faLaptop
} from "@fortawesome/free-solid-svg-icons"
import { faCircleXmark, faCompass } from "@fortawesome/free-regular-svg-icons"
import {
  faGithub,
  faStrava,
  faXTwitter
} from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"

import App from "./App.vue"
import router from "./router"
import { createApp } from "vue"
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"

const queryClient = new QueryClient()

library.add(
  faArrowLeft,
  faEnvelope,
  faArrowsRotate,
  faGithub,
  faXTwitter,
  faStrava,
  faCompass,
  faCaretLeft,
  faLaptop,
  faCircleXmark,
  faCircleQuestion,
  faFlagCheckered
)

const app = createApp(App)

app.use(VueQueryPlugin, {
  queryClient
})

app.use(router)
app.component("font-awesome-icon", FontAwesomeIcon)
app.mount("#app")
