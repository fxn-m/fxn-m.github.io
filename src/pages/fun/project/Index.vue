<template>
  <div id="content">
    <component :is="selectedComponent" v-if="selectedComponent" />
  </div>
</template>

<script setup lang="ts">
  import ReadingSuggestion from "@/pages/fun/ReadMe/Index.vue"
  import AtmosphereFM from "@/pages/fun/Atmosphere.fm/Index.vue"
  import { useRoute } from "vue-router"
  import { ref, onMounted, type Component } from "vue"

  const selectedComponent = ref<Component>()

  const selectComponent = () => {
    const route = useRoute()
    const routeName = (route.params.name as string).replace(":", "")

    const components = {
      ReadingSuggestion,
      AtmosphereFM
    }

    switch (routeName) {
      case "readme":
        selectedComponent.value = components.ReadingSuggestion
        break
      case "atmosphere-fm":
        selectedComponent.value = components.AtmosphereFM
        break
    }
  }

  onMounted(() => {
    selectComponent()
  })
</script>
