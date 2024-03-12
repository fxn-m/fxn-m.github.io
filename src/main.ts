import "./assets/main.css"

import { faArrowLeft, faCaretLeft } from "@fortawesome/free-solid-svg-icons"
import {
  faGithub,
  faStrava,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons"

import App from "./App.vue"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { createApp } from "vue"
import { faCompass } from "@fortawesome/free-regular-svg-icons"
import { library } from "@fortawesome/fontawesome-svg-core"
import router from "./router"

library.add(faArrowLeft, faGithub, faXTwitter, faStrava, faCompass, faCaretLeft)

const app = createApp(App)

app.use(router)

app.component("font-awesome-icon", FontAwesomeIcon)

app.mount("#app")
