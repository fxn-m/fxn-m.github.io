<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';

const readingSuggestion = ref({
    title: "",
    author: "",
    url: "",
    time: 0,
    type: ""
});

const isLoading = ref(true);

const metadataDiv = ref(null);
const suggestionTypeDiv = ref(null);
const showSeparator = ref(true);

const fetchReadingSuggestion = async () => {
    isLoading.value = true;  
    try {
        // const response = await fetch('https://fxnm-backend-5c0b9af08231.herokuapp.com/reading-suggestion', {
        const response = await fetch('http://localhost:3000/reading-suggestion', {
            method: 'GET'
        });
        const data = await response.json();

        let author = "";
        try {
            author = data.properties['Author/Publisher'].select.name;
            if (author == "" || author == "Other") {
                author = "";
            }
        } catch (error) {
            // handle error if necessary
        }

        readingSuggestion.value = {
            title: data.properties.Name.title[0].plain_text,
            author: author,
            url: data.properties.Link.url,
            time: data.properties["Reading Time"].number,
            type: data.properties.Type.select.name
        };

        if (!data.properties.Link.url || data.properties.Link.url.slice(0,4) !== "http") {
            fetchReadingSuggestion();
        }

    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
    }
};

const checkWrap = () => {
     // @ts-ignore
    const metadataDivHeight = metadataDiv.value?.offsetHeight;
     // @ts-ignore
    const suggestionTypeDivHeight = suggestionTypeDiv.value?.offsetHeight;
    if (metadataDivHeight > suggestionTypeDivHeight) {
        showSeparator.value = false;
    } else {
        showSeparator.value = true;
    }
}

onMounted(() => {
    fetchReadingSuggestion();
    window.addEventListener('resize', checkWrap);
});

watchEffect(() => {
    if (suggestionTypeDiv.value && metadataDiv.value) {
        checkWrap();
    }
})

</script>

<template>
    <div style="position:relative">
        <div v-if="!isLoading" class="reading-suggestion"> 
            <a :href="readingSuggestion.url" target="_blank">{{ readingSuggestion.title }}</a>
            <div class="suggestion-metadata" ref="metadataDiv">
                <p v-if="readingSuggestion.type" ref="suggestionTypeDiv">{{ readingSuggestion.type }}</p>
                <p v-if="readingSuggestion.type && readingSuggestion.author || readingSuggestion.type && readingSuggestion.time">|</p>
                <p v-if="readingSuggestion.author" class="author">{{ readingSuggestion.author }}</p>
                <p v-if="readingSuggestion.time && readingSuggestion.author && showSeparator">|</p>
                <p class="reading-time" v-if="readingSuggestion.time">Estimated reading time: {{ readingSuggestion.time }} minutes</p>
            </div>
            <button @click="fetchReadingSuggestion">Another one!</button>
        </div>
        <div v-else class="reading-suggestion">
            <p>Loading...</p>
        </div>
    </div>
</template>


<style scoped>
.reading-suggestion {
    line-height: 2rem;
    margin-top: 2rem;
}

button {
    position: absolute;
    top: 175px;
    left: 0px;
    font-family: inherit;
    color: #727272;    
    padding: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border: 1px solid #cccccc;
    border-radius: 10px;
    background-color: transparent;
}

.suggestion-metadata {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: left;
    font-size: 0.8rem;
    margin-top: 0;
}

.suggestion-metadata > * {
    margin: 0 1rem 0 0; 
}

body.dark button {
    color: #969696;
    border: 1px solid #272727;
}

button:hover {
    color: #111111;
}

body.dark button:hover {
    color: #dddddd;
}

</style>
