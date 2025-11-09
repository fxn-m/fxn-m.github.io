<template>
  <header class="py-2 mt-4">
    <h2 class="flex font-semibold text-lg">
      <RouterLink
        class="absolute whitespace-nowrap border-none !no-underline font-bolder self-center"
        to="/"
        @mouseover="isHovering = true"
        @mouseout="isHovering = false"
        @click="navigateToParent"
      >
        fxn-m.com<span class="hidden sm:inline-block">{{ pageTitle }}</span>

        <FontAwesomeIcon
          id="popup-arrow"
          icon="fa-solid fa-caret-left"
          class="text-black dark:text-primary-dark absolute -top-2 left-0 size-2"
          :style="{
            visibility: isHovering && route.path !== '/' ? 'visible' : 'hidden'
          }"
        />
      </RouterLink>
    </h2>

    <div id="restOfHeader">
      <ul id="navigation">
        <li v-for="navRoute in routes" :key="navRoute.path">
          <RouterLink
            :to="navRoute.path"
            :class="{ active: route.path === navRoute.path }"
          >
            {{ navRoute.name }}
          </RouterLink>
        </li>
      </ul>

      <Sheet v-model:open="isMobileMenuOpen">
        <SheetTrigger as-child>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="sm:hidden cursor-pointer translate-y-px text-muted-foreground transition-all duration-1000 rounded-none"
            aria-label="open navigation drawer"
          >
            <Bars3Icon class="size-6" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          class="flex h-full w-full max-w-[90vw] flex-col gap-6 p-6 py-12 text-foreground"
        >
          <div class="grid grid-cols-1">
            <CurrentTrack
              variant="sheet"
              :sheet-tile-class="drawerTileClasses"
            />

            <nav class="grid gap-2">
              <SheetClose
                v-for="route in routes"
                :key="`drawer-route-${route.path}`"
                as-child
              >
                <RouterLink :to="route.path" :class="drawerTileClasses">
                  <span class="truncate">{{ route.name }}</span>
                  <span class="text-[10px] font-medium text-muted-foreground/80"
                    >open</span
                  >
                </RouterLink>
              </SheetClose>
            </nav>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <SheetClose
              v-for="link in links"
              :key="`drawer-link-${link.href}`"
              as-child
            >
              <a
                :href="link.href"
                target="_blank"
                rel="noreferrer noopener"
                :class="drawerTileClasses"
              >
                <span class="flex items-center gap-3 truncate">
                  <FontAwesomeIcon
                    :icon="link.icon"
                    :class="['text-lg', link.class]"
                  />
                  <span class="truncate">{{ link.label }}</span>
                </span>
                <ArrowUpRightIcon class="size-4 text-muted-foreground/70" />
              </a>
            </SheetClose>
          </div>

          <SheetFooter class="mt-auto">
            <ThemeToggle
              class="self-center size-20"
              :is-mobile-menu-open="isMobileMenuOpen"
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
        <!-- pass isMobileMenuOpen to ThemeToggle -->
        <ThemeToggle :is-mobile-menu-open="isMobileMenuOpen" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import { ArrowUpRightIcon, Bars3Icon } from "@heroicons/vue/24/outline"
  import { computed, ref, watch } from "vue"
  import { RouterLink, useRoute, useRouter } from "vue-router"

  import CurrentTrack from "@/client/components/spotify/CurrentTrack.vue"
  import ThemeToggle from "@/client/components/theme/ThemeToggle.vue"
  import { Button } from "@/client/components/ui/button"
  import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetTrigger
  } from "@/client/components/ui/sheet"

  const route = useRoute()
  const router = useRouter()
  const isHovering = ref(false)
  const isMobileMenuOpen = ref(false)

  const routes = [
    { path: "/", name: "/" },
    { path: "/writing", name: "writing" },
    { path: "/fun", name: "fun" }
  ]

  watch(
    () => route.path,
    () => {
      isMobileMenuOpen.value = false
    }
  )

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
      class: "fa-github",
      label: "github"
    },
    {
      href: "https://x.com/fxn__m",
      icon: "fa-brands fa-x-twitter",
      class: "fa-twitter",
      label: "x"
    },
    {
      href: "https://www.strava.com/athletes/29743058",
      icon: "fa-brands fa-strava",
      class: "fa-strava",
      label: "strava"
    },
    {
      href: "https://www.polarsteps.com/FelixNewportMangell",
      icon: "fa-regular fa-compass",
      class: "fa-compass",
      label: "polarsteps"
    }
  ]

  const drawerTileClasses =
    "flex items-center justify-between border border-zinc-200 bg-background/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-foreground transition-all duration-1000 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900/80"
</script>

<style scoped>
  h2 #popup-arrow {
    position: absolute;
    left: -9px;
    transform: rotate(45deg);
  }

  /* Override global link transitions for drawer tiles */
  :deep(a.flex.items-center),
  :deep(a.flex.items-center:hover) {
    transition: all 0.5s ease-in-out !important;
  }
</style>
