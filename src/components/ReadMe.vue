<template>
    <div>
        <div style="margin-top: 20px">
            <p>Suggests a random item from my Notion reading list.</p>
        </div>
        <div v-if="!isLoading" class="reading-suggestion">
            <a :href="readingSuggestion.url" target="_blank">{{ readingSuggestion.title }}</a>
            <div class="suggestion-metadata" ref="metadataDiv">
                <p v-if="readingSuggestion.type" ref="suggestionTypeDiv">{{ readingSuggestion.type }}</p>
                <p
                    v-if="readingSuggestion.type && readingSuggestion.author || readingSuggestion.type && readingSuggestion.time">
                    |</p>
                <p v-if="readingSuggestion.author" class="author">{{ readingSuggestion.author }}</p>
                <p v-if="readingSuggestion.time && readingSuggestion.author && showSeparator">|</p>
                <p class="reading-time" v-if="readingSuggestion.time">Estimated reading time: {{ readingSuggestion.time
                    }} minutes</p>
            </div>
            <button @click="fetchReadingSuggestion">Pick another one</button>
        </div>
        <div v-else-if="!serverUp" id="loader" class="reading-suggestion">Load{{ loadingEllipses }} </div>
    </div>
</template>


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
const loadingEllipses = ref('');
const serverUp = ref(false);

const metadataDiv = ref(null);
const suggestionTypeDiv = ref(null);
const showSeparator = ref(true);

let counter = 0;
const ending = 'ing';
const sendingLoader = setInterval(() => {
    if (readingSuggestion.value.title !== "") {
        clearInterval(sendingLoader);
        loadingEllipses.value = '';
    }
    if (counter > 6) {
        loadingEllipses.value = 'ing.';
        counter = 3;
    } else if (counter > 2) {
        loadingEllipses.value += '.';
    } else {
        loadingEllipses.value += ending[counter];
    }
    counter++;
}, 400);

const fetchReadingSuggestion = async () => {
    isLoading.value = true;
    try {
        const response = await fetch('https://fxnm-backend-5c0b9af08231.herokuapp.com/reading-suggestion', {
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
            console.error(error);
        }

        readingSuggestion.value = {
            title: data.properties.Name.title[0].plain_text,
            author: author,
            url: data.properties.Link.url,
            time: data.properties["Reading Time"].number,
            type: data.properties.Type.select.name
        };

        if (!data.properties.Link.url || data.properties.Link.url.slice(0, 4) !== "http") {
            fetchReadingSuggestion();
        } else if (data.properties.Link.url.includes("notion")) {
            fetchReadingSuggestion();
        }

    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
        serverUp.value = true;
    }
};


const checkWrap = () => {
    if (metadataDiv.value && suggestionTypeDiv.value) {
        // @ts-ignore
        const metadataDivHeight = metadataDiv.value.offsetHeight;
        // @ts-ignore
        const suggestionTypeDivHeight = suggestionTypeDiv.value.offsetHeight;
        if (metadataDivHeight > suggestionTypeDivHeight) {
            showSeparator.value = false;
        } else {
            showSeparator.value = true;
        }
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

<style scoped>
p {
    color: #828282;
    font-size: 0.85em;
}

body.dark p {
    color: #afafaf;
}

.reading-suggestion {
    line-height: 2rem;
    margin-top: 2rem;
}

button {
    margin-top: 40px;
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

.suggestion-metadata>* {
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
