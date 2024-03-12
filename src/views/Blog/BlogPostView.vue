<template>
  <div class="container">
    <div class="metadata">
      <h3>{{ $route.query.title }}</h3>
      <p>{{ $route.query.date }}</p>
    </div>
    <hr />
    <div class="blog" v-html="blogContent"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { useRoute, type LocationQueryValue } from "vue-router"

const route = useRoute()

const blogContent = ref<string>("")

const fetchContent = async (title: LocationQueryValue) => {
  const response = await fetch(`/html/${title}.html`)
  if (response.ok) {
    const html = await response.text()
    blogContent.value = html
  } else {
    console.error("Failed to load blog content:", response.statusText)
  }
}

onMounted(() => {
  fetchContent(route.query.title as LocationQueryValue)
})
</script>

<style scoped>
.container {
  margin-top: 20px;
  width: 100%;
}

.metadata {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
}

.metadata h3 {
  color: #686868;
}

.metadata p {
  color: #b3b3b3;
  font-size: 0.95em;
}

body.dark h3 {
  color: #b3b3b3;
}
</style>
