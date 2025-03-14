<template>
  <header>
    <h2 style="display: flex; --arrow-color: currentcolor">
      <div style="position: relative">
        <FontAwesomeIcon icon="fa-solid fa-caret-left" size="2xs" id="popup-arrow" :style="{
          visibility: isHovering && route.path !== '/' ? 'visible' : 'hidden',
          color: 'var(--arrow-color)',
        }" />
      </div>
      <RouterLink @mouseover="isHovering = true" @mouseout="isHovering = false" to="/" @click="navigateToParent" style="
          white-space: nowrap;
          border: none;
          font-weight: bold;
          align-self: center;
        ">fxn-m.com{{ pageTitle }}
      </RouterLink>
    </h2>

    <div id="restOfHeader">
      <ul id="navigation">
        <li v-for="route in routes" :key="route.path">
          <RouterLink :to="route.path" :class="{ active: route.path === route.path }">{{ route.name }}</RouterLink>
        </li>
      </ul>

      <div id="icons">
        <a v-for="link in links" :key="link.href" :href="link.href" target="_blank">
          <FontAwesomeIcon :icon="link.icon" :size="'2xl'" :class="link.class" />
        </a>

        <ToggleTheme />
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
h2 #popup-arrow {
  position: absolute;
  left: -9px;
  transform: rotate(45deg);
  color: inherit;
}
</style>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router"
import ToggleTheme from "@/components/ToggleTheme.vue"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const isHovering = ref(false)

const routes = [
  { path: "/", name: "About" },
  { path: "/writing", name: "Writing" },
  { path: "/fun", name: "Fun" },
]

const pageTitle = computed(() => {
  const currentRoute = route.path !== "/" ? route.path : ""
  if (currentRoute[currentRoute.length - 1] === "-") {
    return `${currentRoute}`.slice(0, -1).replace(":", "")
  }
  if (currentRoute.split("/")[1] === "writing") {
    return "/" + `${currentRoute}`.split("/")[1].replace(":", "")
  }
  return `${currentRoute}`.replace(":", "")
})

const navigateToParent = () => {
  const pathSegments = route.path.split("/")
  pathSegments.pop()
  const parentPath = pathSegments.join("/") || "/"
  router.push(parentPath)
}

const links = [{
  href: "https://github.com/fxn-m",
  icon: "fa-brands fa-github",
  class: "fa-github"
},
{
  href: "https://x.com/fxn__m",
  icon: "fa-brands fa-x-twitter",
  class: "fa-twitter"
},
{
  href: "https://www.strava.com/athletes/29743058",
  icon: "fa-brands fa-strava",
  class: "fa-strava"
},
{
  href: "https://www.polarsteps.com/FelixNewportMangell",
  icon: "fa-regular fa-compass",
  class: "fa-compass"
}
]


console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
</script>
