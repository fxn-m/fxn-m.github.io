<template>
  <div v-if="!isLoading" class="reading-suggestion">
    <div class="flex justify-between items-center">
      <div>
        <a :href="readingSuggestion.url" target="_blank">
          {{ readingSuggestion.title }}
        </a>

        <div class="suggestion-metadata" ref="metadataDiv">
          <p v-if="readingSuggestion.type" ref="suggestionTypeDiv">
            {{ readingSuggestion.type }}
          </p>

          <p v-if="(readingSuggestion.type && readingSuggestion.author) || (readingSuggestion.type && readingSuggestion.time)">|</p>

          <p v-if="readingSuggestion.author" class="author">
            {{ readingSuggestion.author }}
          </p>

          <p v-if="readingSuggestion.time && readingSuggestion.author && showSeparator">|</p>

          <p class="reading-time" v-if="readingSuggestion.time">Estimated reading time: {{ readingSuggestion.time }} minutes</p>
        </div>
      </div>

      <button
        @click="fetchReadingSuggestion"
        class="text-gray-700 hover:cursor-pointer rotate-icon hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-300"
      >
        <FontAwesomeIcon icon="fa-solid fa-arrows-rotate" size="1x" />
      </button>
    </div>
  </div>

  <div v-else id="loader" class="reading-suggestion">Load{{ loadingEllipses }}</div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect } from "vue"
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

  const readingSuggestion = ref({
    id: "",
    title: "",
    author: "",
    url: "",
    time: 0,
    type: ""
  })

  const isLoading = ref(true)
  const loadingEllipses = ref("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readingList = ref<any[]>([])

  const metadataDiv = ref<HTMLElement | null>(null)
  const suggestionTypeDiv = ref<HTMLDivElement | null>(null)
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
        const item = readingList.value[randomIndex]
        const id = item.id
        const randomArticle = item.properties
        let author = randomArticle["Author/Publisher"].select.name ?? ""

        if (["", "Unknown"].includes(author)) {
          author = ""
        }

        readingSuggestion.value = {
          id,
          title: randomArticle.Name.title[0].plain_text,
          author: author,
          url: randomArticle.Link.url,
          time: randomArticle["Reading Time"].number,
          type: randomArticle.Type.select.name
        }

        if (!randomArticle.Link.url || randomArticle.Link.url.slice(0, 4) !== "http" || randomArticle.Link.url.includes("notion")) {
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
      const metadataDivHeight = metadataDiv.value.offsetHeight
      const suggestionTypeDivHeight = suggestionTypeDiv.value.offsetHeight
      if (metadataDivHeight > suggestionTypeDivHeight) {
        showSeparator.value = false
      } else {
        showSeparator.value = true
      }
    }
  }

  onMounted(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-reading-list`, {
        method: "GET"
      })
      const data = await response.json()
      readingList.value = data
      isLoading.value = false
      fetchReadingSuggestion()

      const params = new URLSearchParams(window.location.search)
      if (params.has("secret")) {
        const secret = params.get("secret")
        if (readingSuggestion.value && readingSuggestion.value && readingSuggestion.value.id) {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mark-read/${readingSuggestion.value.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ secret })
          })

          const json = await JSON.parse(await response.text())

          console.log("Marked as read:", json.message)
        } else {
          console.error("readingSuggestion or readingSuggestion.value.id is not properly initialized")
        }
      }

      window.addEventListener("resize", checkWrap)
    } catch (error) {
      console.error("Error fetching reading list:", error)
    }
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

button {
  min-width: 0px;
  padding: 0px;
  border-radius: 100%;
  width: 36px;
  aspect-ratio: 1/1;
}

.reading-suggestion {
    line-height: 2em;
}

.suggestion-metadata {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;  
    justify-content: left;
    font-size: 0.8rem;
    line-height: 2em;
}

.suggestion-metadata > * {
    margin: 0 1rem 0 0;
}

.rotate-icon {
  transition: transform 0.5s ease;
  transform: rotate(0deg);
}

.rotate-icon:hover {
  transform: rotate(180deg);
}
</style>
