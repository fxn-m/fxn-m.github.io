<template>
  <header>
    <h2 style="display: flex; --arrow-color: currentcolor">
      <div style="position: relative">
        <FontAwesomeIcon
          icon="fa-solid fa-caret-left"
          size="2xs"
          id="popup-arrow"
          :style="{
            visibility: isHovering && route.path !== '/' ? 'visible' : 'hidden',
            color: 'var(--arrow-color)',
          }"
        />
      </div>
      <RouterLink
        @mouseover="isHovering = true"
        @mouseout="isHovering = false"
        to="/"
        @click="navigateToParent"
        style="
          white-space: nowrap;
          border: none;
          font-weight: bold;
          align-self: center;
        "
        >fxn-m{{ pageTitle }}
      </RouterLink>
    </h2>

    <div id="restOfHeader">
      <ul id="navigation">
        <RouterLink to="/">About</RouterLink>
        <RouterLink to="/writing">Writing</RouterLink>
        <RouterLink to="/fun">Fun</RouterLink>
      </ul>
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
        <a
          href="https://www.polarsteps.com/FelixNewportMangell"
          target="_blank"
        >
          <FontAwesomeIcon
            icon="fa-regular fa-compass"
            size="2xl"
            class="fa-compass"
          />
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

console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
</script>
