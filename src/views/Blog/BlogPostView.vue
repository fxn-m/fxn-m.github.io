<template>
    <div class="container">
        <div class="metadata">
            <h3>{{ $route.query.title }}</h3>
            <p>{{ $route.query.date }}</p>
        </div>
        <hr>
        <div class="blog" v-html="blogContent">
        </div>
    </div>
</template>


<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, type LocationQueryValue } from 'vue-router';
import showdown, { type Metadata } from "showdown";
import axios from 'axios';


const route = useRoute();  // get current route object

const blogContent = ref<string>('');
const blogMetadata = ref<Metadata>({});

const conv = new showdown.Converter({ metadata: true });

const fetchContent = async (id: LocationQueryValue) => {
    const k = import.meta.env.VITE_STRAPI_API_KEY
    const posts = await axios.get(`https://fxnm-strapi-blog-9e2c8c1b9091.herokuapp.com/api/articles/${id}`, {
        headers: {
            Authorization: `Bearer ${k}`,
        },
    });
    const content = await posts.data.data.attributes.Content;
    console.log(content)
    const html = conv.makeHtml(content);
    const metadata = conv.getMetadata() as Metadata;

    blogContent.value = html
    blogMetadata.value = metadata

    return content;
}


onMounted(() => {
    fetchContent(route.query.id as LocationQueryValue)
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
    align-items: baseline;
    justify-content: space-between;
}

.metadata h3 {
    color: #686868;
}

.metadata p {
    color: #b3b3b3;
    font-size: 0.95em;
}

body.dark h3 {
    color: #b3b3b3;
}
</style>