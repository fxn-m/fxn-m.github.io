<!-- a component that is displayed when the server is warming up -->
<!-- consists of a simple lucie Loading2 spinner with a "servers warming up" next to it, and a radix popover on hover explaining that I'm broke  -->
<!-- determines if the server is warming up by polling the "/ping" GET route on the backend, if loading is true -->

<template>
  <div class="absolute top-0 right-0 p-4">
    <div v-if="isWarmingUp" class="relative flex items-center gap-2 justify-between" @mouseenter="showPopover = true" @mouseleave="showPopover = false">
      <p class="text-sm text-gray-500 underline decoration-dashed underline-offset-4 hover:cursor-pointer">Server is warming up...</p>
      <Loader2 class="animate-spin size-4 text-gray-500" />
      <transition name="fade">
        <div v-if="showPopover" class="absolute top-full text-gray-600 text-xs text-center w-full rounded mt-2">(I'm broke)</div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Loader2 } from "lucide-vue-next"
  import { ref, onMounted, onUnmounted } from "vue"

  const isWarmingUp = ref(true)
  const showPopover = ref(false)
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
