<template>
  <div class="container mt-4 sm:mt-16">
    <div class="metadata">
      <h1>{{ metadata.title }}</h1>
      <p>{{ metadata.date }}</p>
    </div>
    <div class="blog" v-html="blogContent"></div>
  </div>
</template>

<script lang="ts" setup>
  import type { BlogMetadata } from "@/shared"
  import { onMounted, ref } from "vue"
  import { useRoute } from "vue-router"
  import { convertMarkdownToHTML } from "@/server/utils/blogUtils"

  const route = useRoute()
  const blogContent = ref<string>("")
  const metadata = ref({} as BlogMetadata)

  const slugMap = localStorage.getItem("slugMap") && JSON.parse(localStorage.getItem("slugMap") as string)

  // TODO: fetch from the bundle if in production
  const fetchContent = async (slug: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blog/${slugMap[slug ?? ""]}`, {
        method: "GET"
      })
      const markdown = await response.json()

      const { content, meta } = convertMarkdownToHTML(markdown)
      blogContent.value = content
      metadata.value = meta
    } catch (error) {
      console.error("Failed to load blog content:", error)
    }
  }

  onMounted(() => {
    fetchContent(route.params.slug as string)
  })
</script>

<style scoped>
  .container {
    width: 100%;
}

.metadata {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    align-items: baseline;
    justify-content: space-between;
}

.metadata h3 {
    color: #686868;
}

.metadata p {
    color: #b3b3b3;
    font-size: 0.95em;
    flex-grow: 1;
    text-align: right;
}

h1 {
  margin: 0;
  flex: 0 0 auto;
  text-decoration: none;
  transition: color 0s ease-in-out;
  font-size: xx-large;

  font-weight: 600;
}

.blog:deep(h1) {
  margin: 0;
  flex: 0 0 auto;
  text-decoration: none;
  transition: color 0s ease-in-out;
  font-size: x-large;
  font-weight: 600;
}

p {
  margin: 1em 0;
}

.blog:deep(p) {
  margin: 1em 0;
}

body.dark h3 {
    color: #b3b3b3;
}

.blog {
    margin-top: 1em;
}

.blog:deep(ul li) {
    list-style-type: disc;
    margin: 0.5em 0;
}

.blog:deep(ul) {
    margin: 1em 0em 1em 2em;
}

.blog:deep(h1) {
    margin: 1em 0 auto 0;
}

.blog:deep(img) {
    max-width: 100%;
    margin: 1em auto;
}

.blog:deep(em) {
    overflow-x: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
}

.blog:deep(div.YTContainer) {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 2em 0;
}

.blog:deep(div.YTContainer iframe) {
    width: 75%;
    aspect-ratio: 16 / 9;
    margin: 1em auto;
}

.blog:deep(div.YTContainer::after) {
    content: attr(title);
    text-align: center;
    font-size: 0.8em;
    color: #b3b3b3;
}
</style>
