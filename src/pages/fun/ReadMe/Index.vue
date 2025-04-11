<template>
  <div v-if="!isLoading" class="reading-suggestion p-6 shadow-md border border-gray-300 rounded">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <a :href="readingSuggestion.url" target="_blank" class="text-xl font-bold">
          {{ readingSuggestion.name }}
        </a>
        <p v-if="readingSuggestion.summary" class="mt-2 text-gray-700">
          {{ readingSuggestion.summary }}
        </p>
        <div class="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <p v-if="readingSuggestion.readingTime" class="text-sm text-gray-600">
            <span class="font-semibold">Reading Time:</span>
            {{ readingSuggestion.readingTime }} minutes
          </p>
          <div v-if="readingSuggestion.categories && readingSuggestion.categories.length" class="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <span v-for="(category, index) in readingSuggestion.categories" :key="index" class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
              {{ category }}
            </span>
          </div>
        </div>
      </div>
      <button @click="fetchReadingSuggestion" class="ml-4 text-gray-700 hover:text-gray-800 transition-transform transform hover:rotate-180">
        <FontAwesomeIcon icon="fa-solid fa-arrows-rotate" size="lg" />
      </button>
    </div>
  </div>
  <div v-else class="reading-suggestion p-4 border rounded">Loading...</div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue"
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

  // Define the type for the reading suggestion based on the new schema
  interface ReadingSuggestion {
    id: string
    name: string // Guaranteed
    url: string // Guaranteed
    readingTime: number | null
    categories: string[]
    summary: string
  }

  // Reactive references
  const readingSuggestion = ref<ReadingSuggestion>({
    id: "",
    name: "",
    url: "",
    readingTime: null,
    categories: [],
    summary: ""
  })

  type ReadingListItem = {
    id: string
    properties: {
      Name?: { title: { plain_text: string }[] }
      Link?: { url: string }
      "Read Time"?: { number: number }
      Categories?: { multi_select: { name: string }[] }
      Summary?: { rich_text: { plain_text: string }[] }
    }
  }

  const isLoading = ref(true)
  // The reading list will hold the entire response from the backend
  const readingList = ref<ReadingListItem[]>([])

  // Fetch a random reading suggestion and map the new schema fields
  const fetchReadingSuggestion = async () => {
    if (readingList.value.length > 0) {
      try {
        const randomIndex = Math.floor(Math.random() * readingList.value.length)
        const item = readingList.value[randomIndex]
        const props = item.properties || {}

        // Extract fields with safe optional chaining
        const name = props.Name?.title?.[0]?.plain_text || "Untitled"
        const url = props.Link?.url || "#"
        const readingTime = props["Read Time"]?.number || null
        const categories = props.Categories?.multi_select ? props.Categories.multi_select.map((cat) => cat.name) : []
        const summary = props.Summary?.rich_text ? props.Summary.rich_text.map((txt) => txt.plain_text).join(" ") : ""

        readingSuggestion.value = {
          id: item.id,
          name,
          url,
          readingTime,
          categories,
          summary
        }

        // If the suggestion lacks the guaranteed fields, try fetching another
        if (!readingSuggestion.value.name || readingSuggestion.value.url === "#") {
          fetchReadingSuggestion()
        }
      } catch (error) {
        console.error("Error processing reading suggestion:", error)
      }
    } else {
      console.error("Reading list is empty or not loaded")
    }
  }

  // Fetch the reading list from the backend on mount
  onMounted(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/readingList`, {
        method: "GET"
      })
      const data = await response.json()
      readingList.value = data
      isLoading.value = false
      fetchReadingSuggestion()
    } catch (error) {
      console.error("Error fetching reading list:", error)
    }
  })
</script>

<style scoped>
  .reading-suggestion {
  line-height: 1.5;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}
</style>
