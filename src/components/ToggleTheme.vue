<template>
  <button id="toggle-btn" @click="toggleTheme">
    <img :src="iconSrc" :id="iconId" />
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { useThemeState } from "./themeState"

const { isDarkTheme, toggleTheme } = useThemeState()

const iconSrc = computed(() =>
  isDarkTheme.value ? "/dark-mode.svg" : "/light-mode.svg"
)
const iconId = computed(() =>
  isDarkTheme.value ? "dark-mode-icon" : "light-mode-icon"
)

onMounted(() => {
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)")

  if (isDarkTheme.value) {
    document.body.classList.add("dark")
  }

  if (!localStorage.getItem("theme")) {
    isDarkTheme.value = colorSchemeQuery.matches
  }

  colorSchemeQuery.addEventListener("change", () => {
    isDarkTheme.value = colorSchemeQuery.matches
  })

  const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
  const toggleFavicon = () => {
    favicon.setAttribute(
      "href",
      isDarkTheme.value ? "/favicon-dark.png" : "/favicon.png"
    )
  }

  toggleFavicon()
  watch(isDarkTheme, toggleFavicon)
})
</script>
