<template>
  <div id="content" class="space-y-12 sm:pb-0 pb-16">
    <div class="flex flex-col">
      <div v-for="(project, projectIndex) in projects" :key="project.id">
        <div class="project-info space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="flex gap-1 items-center font-semibold">
              <a
                v-if="project.link.includes('https')"
                :href="project.link"
                target="_blank"
                class="flex gap-1 items-center"
                >{{ project.title }}</a
              >
              <RouterLink
                v-else
                :to="project.link"
                class="flex gap-1 items-center"
              >
                {{ project.title }}
              </RouterLink>
            </h3>

            <p
              class="font-light text-sm lowercase text-neutral-400 dark:text-neutral-500"
            >
              {{ project.subtitle }}
            </p>
          </div>

          <p
            class="text-sm text-neutral-600 dark:text-neutral-500"
            v-html="project.description"
          />

          <p class="text-xs text-neutral-400 my-2">
            <span v-if="project.date">{{ project.date }}</span>
          </p>
        </div>

        <!-- thematic break -->
        <div
          v-if="projectIndex !== projects.length - 1"
          class="border-b border-neutral-200 dark:border-neutral-800 my-8"
        />
      </div>
    </div>
    <!-- Strava activities -->
    <Activity />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"

  import Activity from "@/client/components/StravaActivity.vue"

  const projects = ref(
    [
      {
        id: 1,
        title: "tab-overflow",
        subtitle: "Overcoming the paradox of choice",
        description: `I come across tonnes of niche little articles on technical topics, general life advice and other bits and pieces. I use a chrome extension to save the links to a Notion database, but rarely get around to reading them. Just glancing at the <span class="font-mono">>400</span class="font-mono"> articles in there makes me shiver, so I got <span class="font-mono">gpt-4o</span> to summarise most of them, and built this front-end to bubble up one at random, with estimated reading time and a few tags.
        The hardest thing about the abundance of information today is deciding <a href="https://jeremy.zawodny.com/blog/archives/008581.html" target="_blank">what to ignore</a>.`,
        link: "/fun/tab-overflow",
        date: "2023-10 (updated 2025-04)"
      },
      {
        id: 2,
        title: "pgt",
        subtitle: "Paul Graham's Essays, Translated",
        description:
          "I noticed that some of Paul Graham's essays had translations in other languages. Not all of them were translated, and some of the translations were incomplete or dead links altogether. I decided to create a website that hosted translations of all his essays, translated into 8 langugages, using 4 LLMs. I imagined that the people that would find this most useful were those that weren't aware of browser's in-built translation features, so I heavily optimised for SEO and performance in Next.js with SSG. Learned a lot about SEO and performance in the process. ",
        link: "https://paulgraham-translated.vercel.app",
        date: "2024-11"
      }
    ].reverse()
  )
</script>
