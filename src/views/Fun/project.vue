<template>
  <div id="content">
    <component :is="selectedComponent" v-if="selectedComponent" />
  </div>
</template>

<script setup lang="ts">
import ReadingSuggestion from "./ReadMe/ReadMe.vue"
import HallOfFame from "./HallOfFame/HallOfFame.vue"
import AtmosphereFM from "./Atmosphere.fm/Index.vue"
import { useRoute } from "vue-router"
import { ref, onMounted, type Component } from "vue"

const selectedComponent = ref<Component>()

const selectComponent = () => {
  const route = useRoute()
  const routeName = (route.params.name as string).replace(":", "")

  const components = {
    ReadingSuggestion,
    HallOfFame,
    AtmosphereFM,
  }

  if (routeName == "readme") {
    selectedComponent.value = components.ReadingSuggestion
  } else if (routeName == "hall-of-fame") {
    selectedComponent.value = components.HallOfFame
  } else if (routeName == "atmosphere-fm") {
    selectedComponent.value = components.AtmosphereFM
  }
}

onMounted(() => {
  selectComponent()
})
</script>
