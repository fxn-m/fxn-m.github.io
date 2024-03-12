<template>
  <div id="content">
    <p>Suggests a random item from my Notion reading list.</p>
    <div v-if="!isLoading" class="reading-suggestion">
      <a :href="readingSuggestion.url" target="_blank">{{
        readingSuggestion.title
      }}</a>
      <div class="suggestion-metadata" ref="metadataDiv">
        <p v-if="readingSuggestion.type" ref="suggestionTypeDiv">
          {{ readingSuggestion.type }}
        </p>
        <p
          v-if="
            (readingSuggestion.type && readingSuggestion.author) ||
            (readingSuggestion.type && readingSuggestion.time)
          "
        >
          |
        </p>
        <p v-if="readingSuggestion.author" class="author">
          {{ readingSuggestion.author }}
        </p>
        <p
          v-if="
            readingSuggestion.time && readingSuggestion.author && showSeparator
          "
        >
          |
        </p>
        <p class="reading-time" v-if="readingSuggestion.time">
          Estimated reading time: {{ readingSuggestion.time }} minutes
        </p>
      </div>
      <button @click="fetchReadingSuggestion">Pick another one</button>
    </div>
    <div v-else id="loader" class="reading-suggestion">
      Load{{ loadingEllipses }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue"

const readingSuggestion = ref({
  title: "",
  author: "",
  url: "",
  time: 0,
  type: "",
})

const isLoading = ref(true)
const loadingEllipses = ref("")
const readingList = ref([] as any)

const metadataDiv = ref(null)
const suggestionTypeDiv = ref(null)
const showSeparator = ref(true)

let counter = 0
const ending = "ing"
const sendingLoader = setInterval(() => {
  if (readingSuggestion.value.title !== "") {
    clearInterval(sendingLoader)
    loadingEllipses.value = ""
  }
  if (counter > 6) {
    loadingEllipses.value = "ing."
    counter = 3
  } else if (counter > 2) {
    loadingEllipses.value += "."
  } else {
    loadingEllipses.value += ending[counter]
  }
  counter++
}, 400)

const fetchReadingSuggestion = async () => {
  if (readingList.value.length > 0) {
    try {
      const randomIndex = Math.floor(Math.random() * readingList.value.length)
      const randomArticle = readingList.value[randomIndex].properties
      let author = ""
      author = randomArticle["Author/Publisher"].select.name
      if (author == "" || author == "Other") {
        author = ""
      }
      readingSuggestion.value = {
        title: randomArticle.Name.title[0].plain_text,
        author: author,
        url: randomArticle.Link.url,
        time: randomArticle["Reading Time"].number,
        type: randomArticle.Type.select.name,
      }

      if (
        !randomArticle.Link.url ||
        randomArticle.Link.url.slice(0, 4) !== "http" ||
        randomArticle.Link.url.includes("notion")
      ) {
        fetchReadingSuggestion()
      }
    } catch (error) {
      console.error("Error reading file:", error)
    }
  } else {
    console.error("Reading list not found")
  }
}

const checkWrap = () => {
  if (metadataDiv.value && suggestionTypeDiv.value) {
    // @ts-ignore
    const metadataDivHeight = metadataDiv.value.offsetHeight
    // @ts-ignore
    const suggestionTypeDivHeight = suggestionTypeDiv.value.offsetHeight
    if (metadataDivHeight > suggestionTypeDivHeight) {
      showSeparator.value = false
    } else {
      showSeparator.value = true
    }
  }
}

onMounted(async () => {
  let data
  while (!data) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/get-reading-list`,
        {
          method: "GET",
        }
      )
      data = await response.json()
    } catch (error) {
      console.error("Error fetching reading list:", error)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  readingList.value = data
  isLoading.value = false
  fetchReadingSuggestion()

  window.addEventListener("resize", checkWrap)
})

watchEffect(() => {
  if (suggestionTypeDiv.value && metadataDiv.value) {
    checkWrap()
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
  line-height: 2em;
  margin: 1.5em 0;
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
