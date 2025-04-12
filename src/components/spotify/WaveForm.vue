<template>
  <div class="flex justify-center items-center gap-0.5 h-3">
    <div
      v-for="(bar, i) in bars"
      :key="i"
      class="w-0.5 rounded-sm bg-gray-400 animate-wave"
      :style="{
        animationDelay: `${bar.delay}ms`,
        animationDuration: `${bar.duration}s`
      }"
    />
  </div>
</template>

<script setup>
  const numBars = 4

  const bars = Array.from({ length: numBars }).map(() => ({
    delay: Math.floor(Math.random() * 400),
    duration: (0.8 + Math.random() * 0.6).toFixed(2) // 0.8s - 1.4s
  }))
</script>

<style scoped>
  @keyframes wave {
  0%, 100% {
    height: 50%;
  }
  50% {
    height: 100%;
  }
}

.animate-wave {
  animation-name: wave;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
</style>
