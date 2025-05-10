<template>
  <div id="content" class="space-y-8">
    <div class="project-grid">
      <div
        class="project-card"
        v-for="project in projects"
        :key="project.id"
      >
        <div class="project-info space-y-2">
          <h3 class="flex gap-1 items-center font-semibold">
            <a
              v-if="project.link.includes('https')"
              :href="project.link"
              target="_blank"
              class="flex gap-1 items-center"
              >{{ project.title }}<Link class="size-3"
            /></a>
            <RouterLink
              v-else
              :to="project.link"
              class="flex gap-1 items-center"
              >{{ project.title }}<Link class="size-3"
            /></RouterLink>
          </h3>

          <p
            class="font-light text-sm text-primary-light dark:text-primary-dark"
          >
            {{ project.subtitle }}
          </p>

          <p
            v-html="project.description"
            class="text-sm text-gray-600 dark:text-gray-500"
          ></p>

          <p class="text-xs text-gray-400 my-2">
            <span v-if="project.date">{{
              project.date
            }}</span>
          </p>
        </div>
      </div>
    </div>

    <hr
      class="border-gray-200 dark:border-gray-700 transition-all duration-500"
    />

    <h2 class="text-xl font-semibold mt-8 mb-4">
      I'm also running a marathon
    </h2>
    <Activity />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import { Link } from "lucide-vue-next"
  import Activity from "@/components/strava/Activity.vue"

  const projects = ref(
    [
      {
        id: 1,
        title: "Atmosphere.fm (discontinued)",
        subtitle: "Soundtracks shaped by skies",
        description: `Intelligently curated spotify playlists based on the local weather and time of day. My first "full-stack" project, built in 2023. Relied on Spotify's personalised mixes, which were removed from the API in 2024. I had to discontinue the project, but it was a great learning experience.`,
        link: "/fun/:atmosphere-fm",
        date: "2023-06"
      },
      {
        id: 2,
        title: "TabOverflow",
        subtitle: "Overcoming the paradox of choice",
        description: `I come across tonnes of niche little articles on technical topics, general life advice and other bits and pieces. I use a chrome extension to save the links to a Notion database, but rarely get around to reading them. Just glancing at the <span class="font-mono">>400</span class="font-mono"> articles in there makes me shiver, so I got <span class="font-mono">gpt-4o</span> to summarise most of them, and built this front-end to bubble up one at random, with estimated reading time and a few tags.
        The hardest thing about the abundance of information today is deciding <a href="https://jeremy.zawodny.com/blog/archives/008581.html" target="_blank">what to ignore</a>.`,
        link: "/fun/:tab-overflow",
        date: "2023-10 (updated 2025-04)"
      },
      {
        id: 3,
        title: "PGT",
        subtitle: "Paul Graham's Essays, Translated",
        description:
          "I noticed that some of Paul Graham's essays had translations in other languages. Not all of them were translated, and some of the translations were incomplete or dead links altogether. I decided to create a website that hosted translations of all his essays, translated into 8 langugages, using 4 LLMs. I imagined that the people that would find this most useful were those that weren't aware of browser's in-built translation features, so I heavily optimised for SEO and performance in Next.js with SSG. Learned a lot about SEO and performance in the process. ",
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
