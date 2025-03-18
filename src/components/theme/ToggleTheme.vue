<template>
  <div class="theme-toggle-wrapper">
    <button
      class="size-full flex items-center justify-center"
      id="toggle-btn"
      @click="toggleTheme"
      :title="tooltipText"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <img class="size-[28px]" v-if="iconSrc" :src="iconSrc" :id="iconId" :alt="tooltipText" />
    </button>
    <span v-if="showTooltip" class="tooltip">{{ tooltipText }}</span>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from "vue"
  import { theme } from "./themeState"

  const showTooltip = ref(false)
  const tooltipText = computed(() => `${theme.value}`)

  const currentIconSrc = ref("/light-mode.svg")
  const currentIconId = ref("light-mode-icon")

  const toggleTheme = () => {
    theme.value = theme.value === "system" ? "dark" : theme.value === "dark" ? "light" : "system"
    sessionStorage.setItem("theme", theme.value)
    updateBodyClass()
  }

  const updateBodyClass = () => {
    const isDark = theme.value === "dark" || (theme.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.body.classList.toggle("dark", isDark)

    currentIconSrc.value = isDark ? "/dark-mode.svg" : "/light-mode.svg"
    currentIconId.value = isDark ? "dark-mode-icon" : "light-mode-icon"
  }

  const iconSrc = computed(() => currentIconSrc.value)
  const iconId = computed(() => currentIconId.value)

  onMounted(() => {
    const darkColorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)")

    if (!sessionStorage.getItem("theme")) {
      theme.value = "system"
    }

    updateBodyClass()

    darkColorSchemeQuery.addEventListener("change", updateBodyClass)

    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
    const toggleFavicon = () => {
      const isDark = theme.value === "dark" || (theme.value === "system" && darkColorSchemeQuery.matches)
      favicon.setAttribute("href", isDark ? "/favicon-dark.png" : "/favicon.png")
    }

    toggleFavicon()
    watch(theme, () => {
      toggleFavicon()
      updateBodyClass()
    })
  })
</script>

<style scoped>
  button {
  background: none;
  border: none;
  cursor: pointer;
  justify-content: center;
}

.theme-toggle-wrapper {
  position: relative;
  display: flex;
  justify-content: start;
  align-items: center;
}

.tooltip {
  position: absolute;
  transform: translateX(40px);
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  text-align: center;
  color: #777
}

body.dark .tooltip {
  color: #aaa;
}

/* // dark mode toggle styling */

#toggle-btn {
  background-color: none;
  border: none;
  font-size: 1.3em;
  padding: 0;
  margin: 0;
  min-width: 40px;
}

#toggle-btn:hover {
  cursor: pointer;
}

#system-mode-icon {
  color: #5a5a5a;
  transition: 0.5s ease-in-out;
}

#system-mode-icon:hover {
  color: #000001;
  transition: 0.5s ease-in-out;
}

body.dark #system-mode-icon {
  color: #949494;
  transition: 0.5s ease-in-out;
}

body.dark #system-mode-icon:hover {
    color: #ffffff;
    transition: 0.5s ease-in-out;
}

#dark-mode-icon {
  filter: invert(69%) sepia(10%) saturate(17%) hue-rotate(318deg)
    brightness(84%) contrast(87%);
  transform: scale(1.3);
  transition: filter 0.5s ease-in-out;
}

#dark-mode-icon:hover {
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%)
    contrast(100%);
}

#light-mode-icon {
  filter: invert(33%) sepia(0%) saturate(15%) hue-rotate(279deg)
    brightness(102%) contrast(91%);
  transition: filter 0.5s ease-in-out;
}

#light-mode-icon:hover {
  filter: invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%)
    contrast(100%);
}
</style>
