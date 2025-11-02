<template>
  <div id="content" class="container">
    <ul class="space-y-2">
      <li v-for="blog in allBlogs" :key="blog.id" class="flex items-center">
        <router-link
          :to="{
            name: 'writingPost',
            params: { slug: blog.slug }
          }"
        >
          {{ blog.title }}
        </router-link>
        <span aria-hidden="true" class="dot-leader"></span>
        <p class="text-xs text-muted-foreground text-right">{{ blog.date }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useQuery } from "@tanstack/vue-query"
  import { onMounted, ref, watchEffect } from "vue"

  import { getSlugMap } from "@/server/utils/blogUtils"
  import type { BlogPost, SlugMap } from "@/shared"

  const allBlogs = ref<BlogPost[]>([])
  const slugMap = ref<SlugMap>()

  const isDev = import.meta.env.DEV

  if (isDev) {
    // ─── Development: use TanStack Query ─────────────────────────────────────────
    const fetchBlogs = async (): Promise<BlogPost[]> => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/blog?development=true`
      )
      return response.json()
    }

    const { data: blogs } = useQuery<BlogPost[]>({
      queryKey: ["blogs"],
      queryFn: fetchBlogs,
      // keep cache sorted so every consumer gets ordered data
      select: (rows) =>
        rows.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    })

    watchEffect(async () => {
      if (!blogs.value) {
        return
      }
      allBlogs.value = blogs.value

      const slugMapResponse = await getSlugMap(blogs.value)
      slugMap.value = slugMapResponse

      if (typeof window !== "undefined") {
        localStorage.setItem("slugMap", JSON.stringify(slugMapResponse))
      }
    })
  } else {
    // ─── Production: plain fetch (kept simple & cached by the browser) ───────────
    onMounted(async () => {
      try {
        const response = await fetch("/html/index.json")
        const blogs = (await response.json()) as BlogPost[]

        allBlogs.value = blogs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        const slugMapResponse = await getSlugMap(blogs)
        slugMap.value = slugMapResponse

        if (typeof window !== "undefined") {
          localStorage.setItem("slugMap", JSON.stringify(slugMapResponse))
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
      }
    })
  }
</script>

<style scoped>
  .container {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: left;
    margin-top: 1em;
  }

  .container p {
    color: #868686;
    font-size: 0.95em;
    margin: 0px 0px 0px 0px;
    min-width: 100px;
  }

  li {
    display: flex;
    align-items: center;
  }

  .dot-leader {
    flex-grow: 1;
    border-bottom: 1px dotted rgba(134, 134, 134, 0.4);
    margin: 0 0.75rem;
  }

  @media (max-width: 1200px) {
    .container {
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
    }

    #section-left {
      border-right: none;
      padding-right: 0px;
    }

    #section-right {
      min-width: 100%;
      padding-left: 0px;
    }
  }
</style>
