<template>
  <div id="content">
    <component :is="selectedComponent" v-if="selectedComponent" />
  </div>
</template>

<script setup lang="ts">
import AnyHTML from "./AnyHTML/AnyHTML.vue"
import ReadingSuggestion from "./ReadMe/ReadMe.vue"
import { useRoute } from "vue-router"
import { ref, onMounted, type Component } from "vue"

const selectedComponent = ref<Component>()

const selectComponent = () => {
  const route = useRoute()
  const routeName = (route.params.name as string).replace(":", "")

  const components = {
    AnyHTML,
    ReadingSuggestion,
  }

  if (routeName == "anyhtml") {
    selectedComponent.value = components.AnyHTML
  } else if (routeName == "readme") {
    selectedComponent.value = components.ReadingSuggestion
  }
}

onMounted(() => {
  selectComponent()
})
</script>
