<template>
  <div class="theme-toggle-wrapper">
    <button id="toggle-btn" @click="toggleTheme" :title="tooltipText" @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false">
      <img v-if="iconSrc" :src="iconSrc" :id="iconId" :alt="tooltipText" />
    </button>

    <span v-if="showTooltip" class="tooltip">{{ tooltipText }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { theme } from "./themeState";

const showTooltip = ref(false);
const tooltipText = computed(() => `${theme.value}`);

const currentIconSrc = ref("/light-mode.svg");
const currentIconId = ref("light-mode-icon");

const toggleTheme = () => {
  theme.value = theme.value === "system" ? "dark" : theme.value === "dark" ? "light" : "system";
  sessionStorage.setItem("theme", theme.value);
  updateBodyClass();
};

const updateBodyClass = () => {
  const isDark = theme.value === "dark" || (theme.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.body.classList.toggle("dark", isDark);

  currentIconSrc.value = isDark ? "/dark-mode.svg" : "/light-mode.svg";
  currentIconId.value = isDark ? "dark-mode-icon" : "light-mode-icon";
};

const iconSrc = computed(() => currentIconSrc.value);
const iconId = computed(() => currentIconId.value);


onMounted(() => {
  const darkColorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

  if (!sessionStorage.getItem("theme")) {
    theme.value = "system";
  }

  updateBodyClass();

  darkColorSchemeQuery.addEventListener("change", updateBodyClass);

  const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  const toggleFavicon = () => {
    const isDark = theme.value === "dark" || (theme.value === "system" && darkColorSchemeQuery.matches);
    favicon.setAttribute("href", isDark ? "/favicon-dark.png" : "/favicon.png");
  };

  toggleFavicon();
  watch(theme, () => {
    toggleFavicon();
    updateBodyClass();
  });
});
</script>

<style scoped>
button {
  background: none;
  border: none;
  cursor: pointer;
  justify-content: center;
  width: 40px;
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
</style>