<template>
  <button id="toggle-btn" @click="toggleTheme" :title="tooltipText">
    <img v-if="iconSrc" :src="iconSrc" :id="iconId" />
    <div v-if="!iconSrc" :id="iconId">
      <FontAwesomeIcon icon="fa-solid fa-laptop" size="sm" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { computed, onMounted, watch } from "vue"
import { theme } from "./themeState";

const tooltipText = computed(() => `Current theme: ${theme.value}`)

const toggleTheme = () => {
  theme.value = theme.value === "system" ? "dark" : theme.value === "dark" ? "light" : "system";
  sessionStorage.setItem("theme", theme.value)
  document.body.classList.toggle("dark", theme.value === "dark" || (theme.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))
}

const iconSrc = computed(() =>
  theme.value === "dark" ? "/dark-mode.svg" : theme.value === "light" ? "/light-mode.svg" : null
)

const iconId = computed(() =>
  theme.value === "dark" ? "dark-mode-icon" : theme.value === "light" ? "light-mode-icon" : "system-mode-icon"
)

onMounted(() => {
  const darkColorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)")

  if (theme.value === "dark" || (theme.value === "system" && darkColorSchemeQuery.matches)) {
    document.body.classList.add("dark")
  }

  if (!sessionStorage.getItem("theme")) {
    theme.value = "system"
    document.body.classList.toggle("dark", darkColorSchemeQuery.matches)
  }

  darkColorSchemeQuery.addEventListener("change", () => {
    if (theme.value === "system") {
      document.body.classList.toggle("dark", darkColorSchemeQuery.matches)
    } else {
      document.body.classList.toggle("dark", theme.value === "dark")
    }
  })

  const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
  const toggleFavicon = () => {
    favicon.setAttribute(
      "href",
      theme.value === "dark" ? "/favicon-dark.png" : "/favicon.png"
    )
  }

  toggleFavicon()
  watch(theme, toggleFavicon)
})
</script>
