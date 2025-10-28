// TODO: tidy up this sh*t
import "./main.css"

import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faGithub,
  faStrava,
  faXTwitter
} from "@fortawesome/free-brands-svg-icons"
import { faCircleXmark, faCompass } from "@fortawesome/free-regular-svg-icons"
import {
  faArrowLeft,
  faArrowsRotate,
  faCaretLeft,
  faCircleQuestion,
  faEnvelope,
  faFlagCheckered,
  faLaptop
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"
import JSConfetti from "js-confetti"
import { createApp } from "vue"

import App from "./client/App.vue"
import router from "./client/router"

export const jsConfetti = new JSConfetti()

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
