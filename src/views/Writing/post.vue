<template>
    <div class="container">
        <div class="metadata">
            <h1>{{ $route.query.title }}</h1>
            <p>{{ $route.query.date }}</p>
        </div>
        <div class="blog" v-html="blogContent"></div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { useRoute, type LocationQueryValue } from "vue-router"

const route = useRoute()

const blogContent = ref<string>("")

const fetchContent = async (title: LocationQueryValue) => {
    const response = await fetch(`/html/${title}.html`)
    if (response.ok) {
        const html = await response.text()
        blogContent.value = html
    } else {
        console.error("Failed to load blog content:", response.statusText)
    }
}

onMounted(() => {
    fetchContent(route.query.title as LocationQueryValue)
})
</script>

<style scoped>
.container {
    margin-top: 50px;
    width: 100%;
}

.metadata {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    align-items: baseline;
    justify-content: space-between;
}

.metadata h3 {
    color: #686868;
}

.metadata p {
    color: #b3b3b3;
    font-size: 0.95em;
    flex-grow: 1;
    text-align: right;
}

body.dark h3 {
    color: #b3b3b3;
}

.blog {
    margin-top: 1em;
}

.blog:deep(ul li) {
    list-style-type: disc;
    margin: 0.5em 0;
}

.blog:deep(ul) {
    margin: 1em 0em 1em 2em;
}

.blog:deep(h1) {
    margin: 1em 0 auto 0;
}

.blog:deep(img) {
    max-width: 100%;
    margin: 1em 0;
}

.blog:deep(div.YTContainer) {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 2em 0;
}

.blog:deep(div.YTContainer iframe) {
    width: 75%;
    aspect-ratio: 16 / 9;
    margin: 1em 0;
}

.blog:deep(div.YTContainer::after) {
    content: attr(title);
    text-align: center;
    font-size: 0.8em;
    color: #b3b3b3;
}
</style>
