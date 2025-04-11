<template>
  <div v-if="!isLoading" class="relative reading-suggestion flex flex-col p-6 min-h-52 shadow-md border border-gray-200 dark:border-gray-900 rounded-lg">
    <div class="absolute top-2 right-2 text-xs text-gray-500">{{ currentItemNumber }} / {{ readingListCount }}</div>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <a :href="readingSuggestion.url" target="_blank" class="text-xl font-bold">
          {{ readingSuggestion.name }}
          <ExternalLink class="inline-block size-3 align-super" />
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
            <span
              v-for="(category, index) in readingSuggestion.categories"
              :key="index"
              class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs dark:bg-gray-700 dark:text-gray-200"
            >
              {{ category }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- Navigation Arrows at the bottom -->
    <div class="mt-auto flex w-full justify-between items-center space-x-8">
      <button
        @click="prevSuggestion"
        class="text-gray-700 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-300"
        :class="{ 'opacity-50 !cursor-not-allowed': currentIndex === 0 }"
        :disabled="currentIndex === 0"
      >
        <FontAwesomeIcon icon="fa-solid fa-arrow-left" size="1x" />
      </button>
      <button @click="nextSuggestion" class="text-gray-700 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-300">
        <FontAwesomeIcon icon="fa-solid fa-arrow-left" size="1x" class="rotate-180" />
      </button>
    </div>
  </div>
  <div v-else class="reading-suggestion p-4 border rounded bg-gray-50">Loading...</div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from "vue"
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import { ExternalLink } from "lucide-vue-next"

  // Define the type for the reading suggestion based on the new schema
  interface ReadingSuggestion {
    id: string
    name: string // Guaranteed
    url: string // Guaranteed
    readingTime: number | null
    categories: string[]
    summary: string
  }

  // Define type for a reading list item
  interface ReadingListItem {
    id: string
    properties: {
      Name?: { title: { plain_text: string }[] }
      Link?: { url: string }
      "Read Time"?: { number: number }
      Categories?: { multi_select: { name: string }[] }
      Summary?: { rich_text: { plain_text: string }[] }
    }
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

  const isLoading = ref(true)
  // The reading list will hold the entire response from the backend
  const readingList = ref<ReadingListItem[]>([])

  // History for navigation (storing indices) and pointer
  const suggestionHistory = ref<number[]>([])
  const currentIndex = ref(-1)

  const currentItemNumber = computed(() => {
    if (currentIndex.value >= 0 && suggestionHistory.value.length > 0) {
      return suggestionHistory.value[currentIndex.value] + 1
    }
    return 0
  })

  const readingListCount = computed(() => readingList.value.length)

  // Helper: Apply a suggestion from a given index
  const applySuggestionFromIndex = (index: number) => {
    const item = readingList.value[index]
    const props = item.properties || {}
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
  }

  // Choose a random index from the reading list
  const chooseRandomIndex = (): number => {
    return Math.floor(Math.random() * readingList.value.length)
  }

  // Navigate to the next suggestion
  const nextSuggestion = () => {
    // If we've navigated back previously, move forward in history if possible
    if (currentIndex.value < suggestionHistory.value.length - 1) {
      currentIndex.value++
      applySuggestionFromIndex(suggestionHistory.value[currentIndex.value])
    } else {
      let randomIndex = chooseRandomIndex()
      // Avoid duplicate if possible
      if (suggestionHistory.value.length > 0 && readingList.value.length > 1) {
        while (randomIndex === suggestionHistory.value[suggestionHistory.value.length - 1]) {
          randomIndex = chooseRandomIndex()
        }
      }
      suggestionHistory.value.push(randomIndex)
      currentIndex.value = suggestionHistory.value.length - 1
      applySuggestionFromIndex(randomIndex)
    }
  }

  // Navigate to the previous suggestion if available
  const prevSuggestion = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      applySuggestionFromIndex(suggestionHistory.value[currentIndex.value])
    }
  }

  // Key event listener for arrow keys
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSuggestion()
    } else if (e.key === "ArrowRight") {
      nextSuggestion()
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
      // Start with a random suggestion
      nextSuggestion()

      window.addEventListener("keydown", handleKeydown)
    } catch (error) {
      console.error("Error fetching reading list:", error)
    }
  })

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown)
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
