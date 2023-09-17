<!-- https://v2.vuejs.org/v2/cookbook/serverless-blog -->
<!-- https://docs.strapi.io/dev-docs/quick-start#_1-install-strapi-and-create-a-new-project -->

<template>
  <div class="container">
    <div id="section-left">
      <p>Documenting a work in progress.</p>
    </div>
    <div id="section-right">
      <ul>
        <li v-for="blog in blogs">
          <router-link :to="{ name: 'blogPost', params: { post: blog.headerTitle }, query: { id: blog.id, title: blog.title, date: blog.date } }" style="margin: 0px 0px;">
            {{ blog.title }}
          </router-link>
          <p>{{ blog.date }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Blog } from "@/types/Blog";
import { getBlogPosts } from '@/utils/blog/blogUtils'

const blogs = ref([] as Blog[]);

const headerTitleIdMap: Record<string, string> = {}

onMounted(async () => {
  const blogPosts = await getBlogPosts();
  blogPosts.map((blog: any) => {
    blogs.value.push({
      id: blog.id,
      title: blog.attributes.Title,
      headerTitle: blog.attributes.HeaderTitle,
      date: blog.attributes.Date,
    });

    headerTitleIdMap[blog.attributes.HeaderTitle] = blog.attributes.Id;
});
});

</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: left;
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

