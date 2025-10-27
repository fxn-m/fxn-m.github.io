<template>
  <div
    class="min-h-80 flex flex-col transition-all duration-1000 overflow-hidden"
  >
    <div
      v-if="isLoading"
      class="flex flex-1 gap-2 flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400 transition-color duration-1000"
    >
      <p class="text-sm">Loading...</p>
      <Loader2 class="animate-spin size-6" />
    </div>

    <div
      v-else
      class="relative tab-overflow-suggestion gap-2 flex flex-col px-1 py-8 flex-1"
    >
      <div class="absolute top-2 right-2 text-xs text-gray-500">
        {{ currentItemNumber }} / {{ tabOverflowCount }} on
        <a
          :href="`https://notion.so/fxn-m/${tabOverflowSuggestion.id.replace(
            /-/g,
            ''
          )}`"
          target="_blank"
          class="!text-inherit"
          >Notion</a
        >
      </div>

      <div class="space-y-4 sm:space-y-6 sm:min-h-60 min-h-72">
        <p>
          <a
            :href="tabOverflowSuggestion.url"
            target="_blank"
            class="text-lg font-bold inline-flex items-start gap-1 break-words"
          >
            {{ tabOverflowSuggestion.name }}
            <ExternalLink class="inline-block size-3 flex-shrink-0 mt-1" />
          </a>
        </p>

        <p
          v-if="tabOverflowSuggestion.summary"
          class="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-500 line-clamp-6 sm:line-clamp-none"
        >
          {{ tabOverflowSuggestion.summary }}
        </p>

        <div class="flex flex-col sm:flex-row sm:items-center mt-3 sm:gap-2">
          <p
            v-if="tabOverflowSuggestion.readingTime"
            class="text-xs sm:text-sm text-gray-600"
          >
            <span class="font-semibold">Reading Time:</span>
            {{ tabOverflowSuggestion.readingTime }} minutes
          </p>

          <div
            v-if="
              tabOverflowSuggestion.categories &&
              tabOverflowSuggestion.categories.length
            "
            class="flex flex-wrap gap-2 mt-2 sm:mt-0"
          >
            <span
              v-for="(category, index) in tabOverflowSuggestion.categories"
              :key="index"
              class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs dark:bg-gray-700 dark:text-gray-200 transition-colors duration-1000"
            >
              {{ category }}
            </span>
          </div>
        </div>
      </div>
      <!-- Navigation Arrows at the bottom -->
      <div class="flex flex-1 w-full justify-between items-end mt-4">
        <button
          class="text-gray-800 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-400 p-2"
          :class="{
            'opacity-50 cursor-not-allowed': currentIndex === 0
          }"
          :disabled="currentIndex === 0"
          @click="prevSuggestion"
        >
          <FontAwesomeIcon
            icon="fa-solid fa-arrow-left"
            class="sm:text-base text-xl"
          />
        </button>
        <button
          class="text-gray-800 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-400 p-2"
          @click="nextSuggestion"
        >
          <FontAwesomeIcon
            icon="fa-solid fa-arrow-left"
            class="rotate-180 sm:text-base text-xl"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import { useQuery } from "@tanstack/vue-query"
  import { ExternalLink, Loader2 } from "lucide-vue-next"
  import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue"

  // Define the type for the tab overflow suggestion based on the new schema
  interface TabOverflowSuggestion {
    id: string
    name: string // Guaranteed
    url: string // Guaranteed
    readingTime: number | null
    categories: string[]
    summary: string
  }

  // Define type for a tab overflow item
  interface TabOverflowItem {
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
  const tabOverflowSuggestion = ref<TabOverflowSuggestion>({
    id: "",
    name: "",
    url: "",
    readingTime: null,
    categories: [],
    summary: ""
  })

  const fetchTabOverflow = async (): Promise<TabOverflowItem[]> => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/tab-overflow`,
      {
        method: "GET"
      }
    )

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    return (await response.json()) as TabOverflowItem[]
  }

  const { data, isLoading } = useQuery({
    queryKey: ["tab-overflow"],
    queryFn: fetchTabOverflow,
    refetchOnWindowFocus: false
  })

  const tabOverflowItems = computed(() => data.value ?? [])

  // History for navigation (storing indices) and pointer
  const suggestionHistory = ref<number[]>([])
  const currentIndex = ref(-1)

  const currentItemNumber = computed(() => {
    if (currentIndex.value >= 0 && suggestionHistory.value.length > 0) {
      return suggestionHistory.value[currentIndex.value] + 1
    }
    return 0
  })

  const tabOverflowCount = computed(() => tabOverflowItems.value.length)

  // Helper: Apply a suggestion from a given index
  const applySuggestionFromIndex = (index: number) => {
    const item = tabOverflowItems.value[index]
    const props = item.properties || {}
    const name = props.Name?.title?.[0]?.plain_text || "Untitled"
    const url = props.Link?.url || "#"
    const readingTime = props["Read Time"]?.number || null
    const categories = props.Categories?.multi_select
      ? props.Categories.multi_select.map((cat) => cat.name)
      : []
    const summary = props.Summary?.rich_text
      ? props.Summary.rich_text.map((txt) => txt.plain_text).join(" ")
      : ""

    tabOverflowSuggestion.value = {
      id: item.id,
      name,
      url,
      readingTime,
      categories,
      summary
    }
  }

  // Choose a random index from the tab overflow items
  const chooseRandomIndex = (): number => {
    return Math.floor(Math.random() * tabOverflowItems.value.length)
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
      if (suggestionHistory.value.length > 0 && tabOverflowItems.value.length > 1) {
        while (
          randomIndex ===
          suggestionHistory.value[suggestionHistory.value.length - 1]
        ) {
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

  // Kick off the first suggestion once data is ready
  watchEffect(() => {
    if (
      !isLoading.value &&
      currentIndex.value === -1 &&
      tabOverflowCount.value > 0
    ) {
      nextSuggestion()
    }
  })

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown)
  })
</script>

<style scoped>
  .tab-overflow-suggestion {
    line-height: 1.5;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    touch-action: manipulation;
  }

  button {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
