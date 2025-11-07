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
        <li v-for="route in routes" :key="route.path">
          <RouterLink
            :to="route.path"
            :class="{ active: route.path === route.path }"
          >
            {{ route.name }}
          </RouterLink>
        </li>
      </ul>

      <Sheet v-model:open="isMobileMenuOpen">
        <SheetTrigger as-child>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="sm:hidden border border-gray-200/80 bg-background/80 text-muted-foreground shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-all duration-200 hover:bg-muted/50 hover:text-primary focus-visible:ring-primary/60 rounded-none"
            aria-label="open navigation drawer"
          >
            <Bars3Icon class="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          class="w-80 max-w-[90vw] space-y-6 border-gray-200 bg-background/95 px-6 py-6 text-foreground dark:border-gray-800 dark:bg-zinc-950/95"
        >
          <SheetHeader class="space-y-3">
            <SheetTitle class="text-base uppercase tracking-[0.45em] text-foreground/80">
              systems access
            </SheetTitle>
            <SheetDescription class="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/70">
              quick jumps & signal boosts
            </SheetDescription>
          </SheetHeader>

          <nav class="grid gap-2">
            <SheetClose
              v-for="route in routes"
              :key="`drawer-route-${route.path}`"
              as-child
            >
              <RouterLink
                :to="route.path"
                class="flex items-center justify-between border border-gray-200 bg-background/80 px-4 py-3 font-semibold uppercase tracking-[0.35em] text-xs text-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-zinc-900/80"
              >
                <span class="truncate">{{ route.name }}</span>
                <span class="text-[10px] font-medium text-muted-foreground/80">go</span>
              </RouterLink>
            </SheetClose>
          </nav>

          <div class="space-y-2">
            <p class="text-[11px] uppercase tracking-[0.35em] text-muted-foreground/70">
              signal relays
            </p>
            <div class="grid gap-2">
              <SheetClose
                v-for="link in links"
                :key="`drawer-link-${link.href}`"
                as-child
              >
                <a
                  :href="link.href"
                  target="_blank"
                  rel="noreferrer noopener"
                  class="flex items-center justify-between border border-gray-200 bg-background/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-zinc-900/80"
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
          </div>

          <SheetFooter class="border-t border-dashed border-gray-300 pt-4 dark:border-gray-700">
            <p class="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60">
              tune interface
            </p>
            <ThemeToggle class="self-start" />
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
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import { ArrowUpRightIcon, Bars3Icon } from "@heroicons/vue/24/outline"
  import { computed, ref, watch } from "vue"
  import { RouterLink, useRoute, useRouter } from "vue-router"

  import ThemeToggle from "@/client/components/theme/ThemeToggle.vue"
  import { Button } from "@/client/components/ui/button"
  import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
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
</script>

<style scoped>
  h2 #popup-arrow {
    position: absolute;
    left: -9px;
    transform: rotate(45deg);
  }
</style>
