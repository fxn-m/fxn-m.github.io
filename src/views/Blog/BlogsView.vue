<template>
  <div style="display: flex; justify-content: space-between; margin-top: 20px;">
    <div id="section-left" style="border-right: solid 1px rgba(150, 150, 150, 0.7); padding-right: 30px;">
      <p>Here are some discoveries and curiosities I came across when working with computers, and some other general
        ideas, and/or questions.</p>
    </div>
    <div style="min-width: 50%; padding-left: 30px;">
      <ul>
        <li v-for="blog in blogsMetadata" :key="blog.id" style="display: flex; justify-content: space-between;">
          <router-link to="blogPost" style="margin: 0px 0px;">{{ blog.title }}</router-link>
          <p style="margin: 0px 0px;">{{ blog.date }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBlogPaths, getBlogPostData } from '@/utils/blog/blogUtils';

const blogsMetadata = ref<any[]>([]);

onMounted(async () => {
  const blogPaths: string[] = getBlogPaths();
  const { metadataArray } = await getBlogPostData(blogPaths);

  blogsMetadata.value = metadataArray;
});

</script>
