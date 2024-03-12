<template>
  <header>
    <h2>
      <div style="position: relative">
        <FontAwesomeIcon
          icon="fa-solid fa-caret-left"
          size="2xs"
          id="popup-arrow"
          :style="{
            visibility: isHovering && route.path !== '/' ? 'visible' : 'hidden',
          }"
        />
      </div>
      <span
        style="white-space: nowrap"
        @mouseover="isHovering = true"
        @mouseout="isHovering = false"
      >
        <RouterLink
          to="/"
          @click="navigateToParent"
          style="border: none; font-weight: bold"
          >fxn-m{{ pageTitle }}
        </RouterLink>
      </span>
    </h2>
    <div id="icons">
      <a href="https://github.com/fxn-m" target="_blank">
        <FontAwesomeIcon
          icon="fa-brands fa-github"
          size="2xl"
          class="fa-github"
        />
      </a>
      <a href="https://x.com/fxn__m" target="_blank">
        <FontAwesomeIcon
          icon="fa-brands fa-x-twitter"
          size="2xl"
          class="fa-twitter"
        />
      </a>
      <a href="https://www.strava.com/athletes/29743058" target="_blank">
        <FontAwesomeIcon
          icon="fa-brands fa-strava"
          size="2xl"
          class="fa-strava"
        />
      </a>
      <a href="https://www.polarsteps.com/FelixNewportMangell" target="_blank">
        <FontAwesomeIcon
          icon="fa-regular fa-compass"
          size="2xl"
          class="fa-compass"
        />
      </a>
      <ToggleTheme />
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
#popup-arrow {
  position: absolute;
  top: -5px;
  left: -9px;
  transform: rotate(45deg);
  transition: color 1s ease-in-out;
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

const pageTitle = computed(() => {
  const currentRoute = route.path !== "/" ? route.path : ""
  if (currentRoute[currentRoute.length - 1] === "-") {
    return `${currentRoute}`.slice(0, -1).replace(":", "")
  }
  return `${currentRoute}`.replace(":", "")
})

const navigateToParent = () => {
  const pathSegments = route.path.split("/")
  pathSegments.pop()
  const parentPath = pathSegments.join("/") || "/"
  router.push(parentPath)
}

console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
</script>
./ToggleTheme.vue
