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

const fetchContent = async (id: LocationQueryValue) => {
    const k =
        "ebce4a1b10e1782909b0379022674f8b25c2d622c76087150bf5bdcbe9189d9bb3e97affaa8a0e2afc47555fd34a617b67fb8d935f4b79b02474b1c83c6e7a33a47a1e9524a6b73d9490fedb1649f1d0954d76f38632ecab15aedfce9da029178bf001ff87a2f5d53c240090cdf88544d7ef9ec89f0238aac08eeec0507fd6b5";
    const posts = await axios.get(`http://localhost:1337/api/articles/${id}`, {
        headers: {
            Authorization: `Bearer ${k}`,
        },
    });
    const content = await posts.data.data.attributes.Content;
    console.log(content);
    const html = conv.makeHtml(content);
    const metadata = conv.getMetadata() as Metadata;

    blogContent.value = html
    blogMetadata.value = metadata

    return content;
}

const conv = new showdown.Converter({ metadata: true });

onMounted(() => {
    console.log('mounted')
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