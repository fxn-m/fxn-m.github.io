<template>
  <div
    class="min-h-80 flex flex-col transition-all duration-1000 overflow-hidden"
  >
    <div
      v-if="isLoading"
      class="flex flex-1 flex-col items-center justify-center gap-4 py-8 transition-colors duration-1000"
    >
      <div class="w-full">
        <div
          class="border border-gray-200 bg-white/80 p-6 backdrop-blur dark:border-gray-800 dark:bg-zinc-900/60 animate-pulse"
        >
          <div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="mt-6 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="mt-3 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div class="mt-2 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="block h-6 w-20 bg-gray-200 dark:bg-gray-700" />
            <span class="block h-6 w-16 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="block h-9 w-28 bg-gray-200 dark:bg-gray-700" />
            <span class="block h-9 w-28 bg-gray-200 dark:bg-gray-700" />
            <span class="block h-9 w-32 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      ref="suggestionCardRef"
      class="tab-overflow-suggestion flex flex-col items-center justify-center gap-2 my-8 flex-1"
    >
      <div class="mx-auto grid w-full max-w-4xl grid-cols-[auto_1fr_auto]">
        <Button
          type="button"
          variant="ghost"
          class="flex h-full cursor-pointer w-6 items-center justify-center rounded-none border border-r-0 border-gray-200 bg-background/80 p-0 text-muted-foreground transition-colors hover:bg-muted/40 dark:border-gray-800 dark:bg-zinc-900/70"
          :disabled="currentIndex <= 0"
          @click="prevSuggestion"
        >
          <ChevronLeft class="size-4" />
        </Button>

        <div
          class="relative mx-auto flex h-full w-full min-w-0 flex-col overflow-hidden border border-gray-200 bg-background/80 backdrop-blur dark:border-gray-800 dark:bg-zinc-900/70"
        >
          <div class="grid h-full min-w-0">
            <AnimatePresence :initial="false" :custom="transitionDirection">
              <Motion
                v-if="tabOverflowSuggestion.id"
                :key="tabOverflowSuggestion.id"
                tag="div"
                class="col-start-1 row-start-1 flex h-full w-full min-w-0 flex-col"
                :variants="cardVariants"
                :initial="'enter'"
                :animate="'center'"
                :exit="'exit'"
                :transition="cardTransition"
              >
                <header
                  class="flex w-full min-w-0 flex-nowrap items-center gap-4 overflow-hidden border-b border-gray-200 py-3 px-4 dark:border-gray-800"
                >
                  <a
                    :href="tabOverflowSuggestion.url"
                    target="_blank"
                    class="block min-w-0 flex-1 lowercase truncate text-md sm:text-lg font-semibold leading-tight text-foreground transition-colors hover:text-primary"
                  >
                    {{ tabOverflowSuggestion.name }}
                  </a>

                  <TooltipProvider>
                    <div class="flex shrink-0 items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            class="rounded-none cursor-pointer"
                            @click="openCurrentLink"
                          >
                            <ArrowUpRight class="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"
                          >open in new tab</TooltipContent
                        >
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger as-child>
                          <Button
                            size="icon-sm"
                            :variant="isCurrentBookmarked ? 'default' : 'ghost'"
                            class="border border-transparent hover:border-primary/40 rounded-none cursor-pointer"
                            @click="toggleBookmarkForCurrent"
                          >
                            <BookmarkCheck
                              v-if="isCurrentBookmarked"
                              class="size-4"
                            />
                            <Bookmark v-else class="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {{
                            isCurrentBookmarked
                              ? "remove bookmark"
                              : "save for later"
                          }}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </header>

                <section class="px-4 py-3 min-w-0">
                  <p
                    v-if="tabOverflowSuggestion.summary"
                    class="text-sm leading-relaxed text-muted-foreground sm:text-base line-clamp-5 min-h-[5lh]"
                  >
                    {{ tabOverflowSuggestion.summary }}
                  </p>
                  <p v-else class="text-sm italic text-muted-foreground">
                    No summary available for this suggestion yet.
                  </p>
                </section>

                <footer
                  class="flex min-w-0 flex-col gap-4 border-t border-gray-200 px-5 py-5 text-xs text-muted-foreground dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex flex-wrap items-center gap-1">
                    <span class="font-medium text-foreground">
                      reading time:
                    </span>
                    <span>
                      {{
                        tabOverflowSuggestion.readingTime
                          ? `${tabOverflowSuggestion.readingTime} minutes`
                          : "Not set"
                      }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(
                        category, index
                      ) in tabOverflowSuggestion.categories"
                      :key="index"
                      class="border lowercase border-gray-300 px-2.5 py-1 text-xs font-medium text-foreground dark:border-gray-700"
                    >
                      {{ category }}
                    </span>
                    <span
                      v-if="!tabOverflowSuggestion.categories.length"
                      class="border border-dashed border-gray-300 px-2.5 py-1 text-xs"
                    >
                      No categories yet
                    </span>
                  </div>
                </footer>
              </Motion>
            </AnimatePresence>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          class="flex h-full cursor-pointer w-6 items-center justify-center rounded-none border border-l-0 border-gray-200 bg-background/80 p-0 text-muted-foreground transition-colors hover:bg-muted/40 dark:border-gray-800 dark:bg-zinc-900/70"
          @click="nextSuggestion"
        >
          <ChevronRight class="size-4" />
        </Button>
      </div>
      <span
        class="pointer-events-none font-mono font-semibold tracking-tight text-muted-foreground text-[10px]"
      >
        {{ currentItemNumber }} / {{ tabOverflowCount }}
      </span>
    </div>

    <!-- Full list of tab-overflow items -->
    <div class="mt-8 border-t border-gray-200 pt-4 dark:border-gray-800">
      <div class="flex flex-wrap items-center justify-between gap-2 h-8">
        <button
          class="gap-1 text-xs border-0 p-0 flex cursor-pointer items-center hover:text-primary font-semibold"
          @click="toggleTableVisibility"
        >
          {{ isTableVisible ? "hide all" : "show all" }}
          <ChevronDown v-if="isTableVisible" class="size-4" />
          <ChevronRight v-else class="size-4" />
        </button>

        <div
          :class="
            cn('flex items-center gap-2', isTableVisible ? 'flex' : 'hidden')
          "
        >
          <Button
            size="sm"
            :variant="showOnlyBookmarked ? 'secondary' : 'ghost'"
            class="gap-1 text-xs"
            @click="toggleBookmarkFilter"
          >
            <BookmarkCheck class="size-4" />
          </Button>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ bookmarkCount }} saved
          </span>
        </div>
      </div>

      <div
        v-if="isTableVisible"
        class="mt-4 overflow-hidden border-gray-200 dark:border-gray-800"
      >
        <div class="overflow-x-auto">
          <Table>
            <TableBody v-if="filteredTableItems.length">
              <TableRow
                v-for="row in filteredTableItems"
                :key="row.item.id"
                :class="[
                  'cursor-pointer transition-colors',
                  row.item.id === tabOverflowSuggestion.id
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-muted/60 dark:hover:bg-zinc-800/70'
                ]"
                @click="openSuggestionFromTable(row.index)"
              >
                <TableCell
                  class="font-medium truncate lowercase max-w-[200px] sm:max-w-[300px] pr-4"
                >
                  {{ row.item.name }}
                </TableCell>
                <TableCell>
                  <span v-if="row.item.readingTime">
                    {{ row.item.readingTime }} min
                  </span>
                  <span v-else class="text-gray-500 dark:text-gray-400">
                    —
                  </span>
                </TableCell>
                <TableCell class="max-w-[200px] lowercase">
                  <div class="flex overflow-x-scroll gap-1 no-scrollbar">
                    <span
                      v-for="(category, index) in row.item.categories"
                      :key="`${row.item.id}-cat-${index}`"
                      class="bg-gray-200 px-2 py-0.5 text-[11px] font-medium dark:bg-zinc-800"
                    >
                      {{ category }}
                    </span>
                    <span
                      v-if="!row.item.categories.length"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      —
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      class="cursor-pointer"
                      @click.stop="toggleBookmarkById(row.item.id)"
                    >
                      <BookmarkCheck
                        v-if="isBookmarked(row.item.id)"
                        class="size-4"
                      />
                      <Bookmark v-else class="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      class="cursor-pointer"
                      @click.stop="openLink(row.item.url)"
                    >
                      <ArrowUpRight class="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody v-else>
              <TableEmpty :colspan="4">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  No items to display. Try saving a bookmark first.
                </span>
              </TableEmpty>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useQuery } from "@tanstack/vue-query"
  import {
    ArrowUpRight,
    Bookmark,
    BookmarkCheck,
    ChevronDown,
    ChevronLeft,
    ChevronRight
  } from "lucide-vue-next"
  import { AnimatePresence, Motion } from "motion-v"
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    watch,
    watchEffect
  } from "vue"

  import { Button } from "@/client/components/ui/button"
  import {
    Table,
    TableBody,
    TableCell,
    TableEmpty,
    TableRow
  } from "@/client/components/ui/table"
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
  } from "@/client/components/ui/tooltip"
  import { cn } from "@/client/lib/utils"

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

  const transitionDirection = ref<1 | -1>(1)
  const cardVariants = {
    enter: (direction: 1 | -1) => ({
      x: direction > 0 ? "100%" : "-100%"
    }),
    center: { x: "0%" },
    exit: (direction: 1 | -1) => ({
      x: direction > 0 ? "-100%" : "100%"
    })
  }
  const cardTransition = {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1] as const
  }

  const BOOKMARK_STORAGE_KEY = "tabOverflow:bookmarks"

  const bookmarkedIds = ref<string[]>([])
  const isTableVisible = ref(false)
  const showOnlyBookmarked = ref(false)
  const suggestionCardRef = ref<HTMLElement | null>(null)

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

  const mapItemToSuggestion = (
    item: TabOverflowItem
  ): TabOverflowSuggestion => {
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

    return {
      id: item.id,
      name,
      url,
      readingTime,
      categories,
      summary
    }
  }

  const normalizedTabOverflowItems = computed(() =>
    tabOverflowItems.value.map((item) => mapItemToSuggestion(item))
  )

  // History for navigation (storing indices) and pointer
  const suggestionHistory = ref<number[]>([])
  const currentIndex = ref(-1)

  const currentItemNumber = computed(() => {
    if (currentIndex.value >= 0 && suggestionHistory.value.length > 0) {
      return suggestionHistory.value[currentIndex.value] + 1
    }
    return 0
  })

  const tabOverflowCount = computed(
    () => normalizedTabOverflowItems.value.length
  )

  const bookmarkCount = computed(() => bookmarkedIds.value.length)

  // Helper: Apply a suggestion from a given index
  const applySuggestionFromIndex = (index: number) => {
    const item = normalizedTabOverflowItems.value[index]
    if (!item) {
      return
    }

    tabOverflowSuggestion.value = { ...item }
  }

  // Choose a random index from the tab overflow items
  const chooseRandomIndex = (): number => {
    return Math.floor(Math.random() * normalizedTabOverflowItems.value.length)
  }

  // Navigate to the next suggestion
  const nextSuggestion = () => {
    if (!normalizedTabOverflowItems.value.length) {
      return
    }

    transitionDirection.value = 1
    // If we've navigated back previously, move forward in history if possible
    if (currentIndex.value < suggestionHistory.value.length - 1) {
      currentIndex.value++
      applySuggestionFromIndex(suggestionHistory.value[currentIndex.value])
    } else {
      let randomIndex = chooseRandomIndex()
      // Avoid duplicate if possible
      if (
        suggestionHistory.value.length > 0 &&
        normalizedTabOverflowItems.value.length > 1
      ) {
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
      transitionDirection.value = -1
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

  const isBookmarked = (id: string) => bookmarkedIds.value.includes(id)

  const persistBookmarks = () => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.setItem(
      BOOKMARK_STORAGE_KEY,
      JSON.stringify(bookmarkedIds.value)
    )
  }

  const loadBookmarks = () => {
    if (typeof window === "undefined") {
      return
    }
    try {
      const stored = window.localStorage.getItem(BOOKMARK_STORAGE_KEY)
      if (!stored) {
        return
      }
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        bookmarkedIds.value = parsed.filter(
          (value): value is string => typeof value === "string"
        )
      }
    } catch (error) {
      console.error("Failed to load Tab Overflow bookmarks", error)
    }
  }

  const filterInvalidBookmarks = () => {
    const availableIds = new Set(
      normalizedTabOverflowItems.value.map((item) => item.id)
    )
    const filtered = bookmarkedIds.value.filter((id) => availableIds.has(id))
    if (filtered.length !== bookmarkedIds.value.length) {
      bookmarkedIds.value = filtered
      persistBookmarks()
    }
  }

  const isCurrentBookmarked = computed(() =>
    isBookmarked(tabOverflowSuggestion.value.id)
  )

  const toggleBookmarkById = (id: string) => {
    if (!id) {
      return
    }
    if (isBookmarked(id)) {
      bookmarkedIds.value = bookmarkedIds.value.filter(
        (bookmarkId) => bookmarkId !== id
      )
    } else {
      bookmarkedIds.value = [...bookmarkedIds.value, id]
    }
    persistBookmarks()
  }

  const toggleBookmarkForCurrent = () => {
    toggleBookmarkById(tabOverflowSuggestion.value.id)
  }

  const openLink = (url: string) => {
    if (!url || url === "#") {
      return
    }
    window.open(url, "_blank", "noopener")
  }

  const openCurrentLink = () => {
    openLink(tabOverflowSuggestion.value.url)
  }

  const toggleTableVisibility = () => {
    isTableVisible.value = !isTableVisible.value
  }

  const toggleBookmarkFilter = () => {
    showOnlyBookmarked.value = !showOnlyBookmarked.value
  }

  const filteredTableItems = computed(() => {
    const bookmarkSet = new Set(bookmarkedIds.value)
    return normalizedTabOverflowItems.value
      .map((item, index) => ({ item, index }))
      .filter(({ item }) =>
        showOnlyBookmarked.value ? bookmarkSet.has(item.id) : true
      )
  })

  const openSuggestionFromTable = (index: number) => {
    if (index < 0 || index >= normalizedTabOverflowItems.value.length) {
      return
    }

    if (currentIndex.value >= 0) {
      const current = suggestionHistory.value[currentIndex.value]
      if (typeof current === "number") {
        transitionDirection.value = index >= current ? 1 : -1
      }
    } else {
      transitionDirection.value = 1
    }

    if (
      suggestionHistory.value.length === 0 ||
      suggestionHistory.value[suggestionHistory.value.length - 1] !== index
    ) {
      suggestionHistory.value.push(index)
    }
    currentIndex.value = suggestionHistory.value.length - 1
    applySuggestionFromIndex(index)
    nextTick(() => {
      scrollToSuggestionCard()
    })
  }

  const scrollToSuggestionCard = () => {
    if (typeof window === "undefined") {
      return
    }
    if (!suggestionCardRef.value) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const rect = suggestionCardRef.value.getBoundingClientRect()
    const viewportCenter = window.innerHeight / 2
    const target = window.scrollY + rect.top + rect.height / 2 - viewportCenter
    window.scrollTo({
      top: target > 0 ? target : 0,
      behavior: "smooth"
    })
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

  watch(normalizedTabOverflowItems, () => {
    filterInvalidBookmarks()
  })

  onMounted(() => {
    loadBookmarks()
    window.addEventListener("keydown", handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown)
  })
</script>
