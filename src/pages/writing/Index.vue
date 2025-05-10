<template>

  <div class="container">

    <ul>

      <li v-for="blog in allBlogs" :key="blog.id">

        <p>{{ blog.date }}</p>
         <router-link
          :to="{
            name: 'writingPost',
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

  onMounted(async () => {
    let allBlogsData: BlogPost[] = []
    switch (import.meta.env.MODE) {
      case "development":
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/blog`
          )
          allBlogsData = await response.json()
        } catch (error) {
          console.error("Error fetching blogs:", error)
        }
        break

      case "production":
        try {
          const response = await fetch("/html/index.json")
          allBlogsData = await response.json()
        } catch (error) {
          console.error("Error fetching blogs:", error)
        }
        break
    }

    allBlogs.value = allBlogsData.sort((a, b) => {
      return (
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      )
    })

    const slugMapResponse = await getSlugMap(allBlogsData)
    slugMap.value = slugMapResponse

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "slugMap",
        JSON.stringify(slugMapResponse)
      )
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

