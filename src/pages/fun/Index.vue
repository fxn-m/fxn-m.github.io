<template>
  <div id="content">
    <div class="project-grid">
      <div class="project-card" v-for="project in projects" :key="project.id">
        <div class="project-info">
          <h3 class="flex gap-1 items-center font-semibold">
            <a v-if="project.link.includes('https')" :href="project.link" target="_blank" class="flex gap-1 items-center"
              >{{ project.title }}<Link class="size-3"
            /></a>
            <RouterLink v-else :to="project.link" class="flex gap-1 items-center">{{ project.title }}<Link class="size-3" /></RouterLink>
          </h3>
          <p class="font-light">{{ project.subtitle }}</p>
          <div class="my-2"></div>
          <p class="text-sm !text-gray-500">{{ project.description }}</p>
          <p class="text-xs !text-gray-400 my-2">
            <span v-if="project.date">{{ project.date }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import { Link } from "lucide-vue-next"

  const projects = ref(
    [
      {
        id: 1,
        title: "ReadMe",
        subtitle: "A reading suggestion engine",
        description: "Picks an item from my Notion reading list at random, overcoming the paradox of choice.",
        link: "/fun/:tab-overflow",
        date: "2023-10"
      },
      {
        id: 2,
        title: "Atmosphere.fm (discontinued)",
        subtitle: "Soundtracks shaped by skies",
        description: "Intelligently curated spotify playlists based on the local weather and time of day.",
        link: "/fun/:atmosphere-fm",
        date: "2024-01"
      },
      {
        id: 3,
        title: "PGT",
        subtitle: "Paul Graham's Essays, Translated",
        description: "A collection of Paul Graham's essays, translated into 8 languages with a selection of LLMs.",
        link: "https://paulgraham-translated.vercel.app",
        date: "2024-11"
      }
    ].reverse()
  )
</script>

<style scoped>
  .project-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.project-card {
  border-left: 1px solid #222;
  padding-left: 1rem;
}
</style>
