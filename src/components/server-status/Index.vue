<template>
  <div class="absolute top-0 right-0 sm:p-4 p-2">
    <div
      v-if="isWarmingUp"
      class="relative flex items-center gap-2 justify-between"
    >
      <Loader2 class="animate-spin size-4 text-gray-500" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Loader2 } from "lucide-vue-next"
  import { ref, onMounted, onUnmounted } from "vue"

  const isWarmingUp = ref(true)
  let intervalId: number

  async function pollServer() {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ping`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      })
      if (response.ok) {
        isWarmingUp.value = false
        clearInterval(intervalId)
      } else {
        isWarmingUp.value = true
      }
    } catch {
      isWarmingUp.value = true
    }
  }

  onMounted(() => {
    pollServer()
    intervalId = window.setInterval(pollServer, 500)
  })

  onUnmounted(() => {
    clearInterval(intervalId)
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
