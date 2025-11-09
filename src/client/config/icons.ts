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

const brandIcons = [faGithub, faStrava, faXTwitter]
const regularIcons = [faCircleXmark, faCompass]
const solidIcons = [
  faArrowLeft,
  faArrowsRotate,
  faCaretLeft,
  faCircleQuestion,
  faEnvelope,
  faFlagCheckered,
  faLaptop
]

export function registerIcons() {
  library.add(...brandIcons, ...regularIcons, ...solidIcons)
}

