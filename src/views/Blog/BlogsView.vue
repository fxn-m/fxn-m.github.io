<template>
  <div class="container">
    <ul>
      <li v-for="blog in blogs">
        <p>{{ blog.date }}</p>
        <router-link
          :to="{
            name: 'blogPost',
            params: { post: blog.headerTitle },
            query: { id: blog.id, title: blog.title, date: blog.date },
          }"
        >
          {{ blog.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

type Blog = {
  id: number
  title: string
  headerTitle: string
  date: string
}

const blogs = ref([] as Blog[])

const headerTitleIdMap: Record<string, string> = {}

onMounted(async () => {
  try {
    const response = await fetch("/html/index.json")
    if (!response.ok) {
      throw new Error("Failed to load blog list")
    }
    const blogList: Blog[] = await response.json()

    blogList
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((blog: any) => {
        blogs.value.push({
          id: blog.id,
          title: blog.title,
          headerTitle: blog.headerTitle,
          date: blog.date,
        })

        headerTitleIdMap[blog.headerTitle] = blog.id
      })
  } catch (error) {
    console.error("Failed to load blog list:", error)
  }
})
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: left;
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

#loader {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  margin: 16px 0px;
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
