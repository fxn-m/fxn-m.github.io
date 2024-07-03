// themeState.ts
import { ref, watch } from "vue"

const isDarkTheme = ref(localStorage.getItem("theme") === "dark")

watch(isDarkTheme, (newValue) => {
  localStorage.setItem("theme", newValue ? "dark" : "light")
  if (newValue) {
    document.body.classList.add("dark")
  } else {
    document.body.classList.remove("dark")
  }
})

export const useThemeState = () => {
  return {
    isDarkTheme,
    toggleTheme: () => {
      isDarkTheme.value = !isDarkTheme.value
    },
  }
}
