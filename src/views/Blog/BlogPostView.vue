<template>
    <div class="container">
        <div class="metadata">
            <h3>{{ blogMetadata.title }}</h3>
            <p>{{ blogMetadata.date }}</p>
        </div>
        <hr>
        <div class="blog" v-html="blogContent">
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import showdown from "showdown";
import { type Metadata } from "showdown";
import { useRoute } from 'vue-router';

const conv = new showdown.Converter({ metadata: true });
const blogContent = ref<string>('');
const blogMetadata = ref<Metadata>({});
const route = useRoute();

onMounted(async () => {
    const blogPostData = await fetch(`/src/content/blog/${route.params.post}.md`);
    const blogPost = await blogPostData.text();
    const html = conv.makeHtml(blogPost);
    const metadata = conv.getMetadata() as Metadata;
    blogContent.value = html
    blogMetadata.value = metadata
})

</script>

<style scoped>
.container {
    margin-top: 20px;
    width: 100%;
}

.metadata {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.metadata h3 {
    color: #686868;
}

body.dark h3 {
    color: #b3b3b3;
}



</style>