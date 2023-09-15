<!-- https://v2.vuejs.org/v2/cookbook/serverless-blog -->

<template>
  <div class="container">
    <div id="section-left">
      <p>Here are some discoveries and curiosities I came across when working with computers, and some other general
        ideas, and/or questions.</p>
    </div>
    <div id="section-right">
      <ul>
        <li v-for="blog in blogs">
          <router-link :to="blog.id" style="margin: 0px 0px;">
            {{ blog.metadata.title }}
          </router-link>
          <p>{{ blog.metadata.date }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBlogPaths, getBlogPostData } from '@/utils/blog/blogUtils';
import { type Blog } from "@/types/Blog";

const blogs = ref<Blog[]>([]);

onMounted(async () => {
  const blogPaths: string[] = getBlogPaths();
  const blogData = await getBlogPostData(blogPaths);
  blogs.value = blogData;
});

</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
}

#section-left {
  border-right: solid 1px rgba(150, 150, 150, 0.7);
  padding-right: 35px;
  text-align: justify;
}

#section-right p {
  color: #868686;
  font-size: 0.95em;
  margin: 0px 0px;
}

#section-right {
  min-width: 50%;
  padding-left: 35px;
}

li {
  display: flex;
  justify-content: space-between;
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
    max-width: 350px
  }
}
</style>

