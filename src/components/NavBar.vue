<template>
  <header class="sm:my-0 !mt-4">
    <h2 class="flex font-bold text-xl">
      <RouterLink
        class="absolute"
        @mouseover="isHovering = true"
        @mouseout="isHovering = false"
        to="/"
        @click="navigateToParent"
        style="
          white-space: nowrap;
          border: none;
          text-decoration: none;
          font-weight: bold;
          align-self: center;
        "
        >fxn-m.com<span class="hidden sm:inline-block">{{ pageTitle }}</span>

        <FontAwesomeIcon
          icon="fa-solid fa-caret-left"
          id="popup-arrow"
          class="text-black dark:text-primary-dark absolute -top-2 left-0 size-2"
          :style="{
            visibility: isHovering && route.path !== '/' ? 'visible' : 'hidden'
          }"
        />
      </RouterLink>
    </h2>

    <div id="restOfHeader">
      <ul id="navigation">
        <li v-for="route in routes" :key="route.path">
          <RouterLink
            :to="route.path"
            :class="{ active: route.path === route.path }"
            >{{ route.name }}</RouterLink
          >
        </li>
      </ul>

      <div id="icons">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          target="_blank"
        >
          <FontAwesomeIcon
            :icon="link.icon"
            :size="'2xl'"
            :class="link.class"
          />
        </a>
        <ToggleTheme />
      </div>
    </div>
  </header>
</template>

<style scoped>
  h2 #popup-arrow {
    position: absolute;
    left: -9px;
    transform: rotate(45deg);
  }
</style>

<script setup lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import { computed, ref } from "vue"
  import { RouterLink, useRoute, useRouter } from "vue-router"

  import ToggleTheme from "@/components/theme/ThemeToggle.vue"

  const route = useRoute()
  const router = useRouter()
  const isHovering = ref(false)

  const routes = [
    { path: "/", name: "/" },
    { path: "/writing", name: "writing" },
    { path: "/fun", name: "fun" }
  ]

  const pageTitle = computed(() => {
    const currentRoute = route.path !== "/" ? route.path : ""
    if (currentRoute[currentRoute.length - 1] === "-") {
      return `${currentRoute}`.slice(0, -1).replace(":", "")
    }
    if (
      currentRoute.split("/")[1] === "writing" ||
      currentRoute.split("/")[1] === "blog"
    ) {
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

  const links = [
    {
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
</script>
