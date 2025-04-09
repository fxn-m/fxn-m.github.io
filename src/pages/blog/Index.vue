<template>
  <div class="container">
    <ul>
      <li v-for="blog in allBlogs" :key="blog.id">
        <p>{{ blog.date }}</p>
        <router-link
          :to="{
            name: 'blogPost',
            params: { slug: blog.slug }
          }"
          >{{ blog.title }}</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue"
  import { getSlugMap } from "@/server/utils/blogUtils"
  import type { BlogPost } from "@/shared"

  const allBlogs = ref([] as BlogPost[])
  const slugMap = ref()

  // TODO: fetch from the bundle if in production
  onMounted(async () => {
    try {
      const allBlogsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blog`)
      const allBlogsData = await allBlogsResponse.json()
      allBlogs.value = allBlogsData.sort((a: BlogPost, b: BlogPost) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })

      const slugMapResponse = await getSlugMap(allBlogsData as BlogPost[])
      slugMap.value = slugMapResponse

      if (typeof window !== "undefined") {
        localStorage.setItem("slugMap", JSON.stringify(slugMapResponse))
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    }
  })
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
    margin: 0px 16px 0px 0px;
    min-width: 100px;
}

li {
    display: flex;
    align-items: center;
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

@media (max-width: 675px) {
    .container {
        max-width: 350px;
    }
}
</style>
