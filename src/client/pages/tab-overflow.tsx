import { useQuery } from "@tanstack/react-query"
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hourglass
} from "lucide-react"
import { useEffect, useEffectEvent, useRef, useState } from "react"

import { cn } from "@/client/lib/utils"

type TabOverflowSuggestion = {
  added: Date | null
  categories: string[]
  id: string
  name: string
  readingTime: number | null
  summary: string
  url: string
}

type TabOverflowItem = {
  id: string
  properties: {
    Added?: { date?: { start?: string | null } | null; type: "date" }
    Categories?: { multi_select: { name: string }[] }
    Name?: { title: { plain_text: string }[] }
    "Read Time"?: { number: number }
    Summary?: { rich_text: { plain_text: string }[] }
    URL?: { url: string }
  }
}

const BOOKMARK_STORAGE_KEY = "tabOverflow:bookmarks"
const EMPTY_ITEMS: TabOverflowItem[] = []
const readingTimeOptions = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "20 min", value: 20 }
] as const

type ReadingTimeValue = (typeof readingTimeOptions)[number]["value"]

function mapItemToSuggestion(item: TabOverflowItem): TabOverflowSuggestion {
  const props = item.properties ?? {}

  return {
    added:
      props.Added?.type === "date" && props.Added.date?.start
        ? new Date(props.Added.date.start)
        : null,
    categories:
      props.Categories?.multi_select?.map((category) => category.name) ?? [],
    id: item.id,
    name: props.Name?.title?.[0]?.plain_text || "Untitled",
    readingTime: props["Read Time"]?.number ?? null,
    summary:
      props.Summary?.rich_text?.map((text) => text.plain_text).join(" ") ?? "",
    url: props.URL?.url || "#"
  }
}

function loadBookmarks() {
  try {
    const stored = window.localStorage.getItem(BOOKMARK_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : []
  } catch (error) {
    console.error("Failed to load Tab Overflow bookmarks", error)
    return []
  }
}

export default function TabOverflow() {
  const suggestionCardRef = useRef<HTMLDivElement | null>(null)
  const readingTimeFilterRootRef = useRef<HTMLDivElement | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isReadingTimeFilterOpen, setIsReadingTimeFilterOpen] = useState(false)
  const [isTableVisible, setIsTableVisible] = useState(false)
  const [selectedReadingTimeFilter, setSelectedReadingTimeFilter] =
    useState<ReadingTimeValue | null>(null)
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)
  const [suggestionHistory, setSuggestionHistory] = useState<number[]>([])
  const [tabOverflowSuggestion, setTabOverflowSuggestion] =
    useState<TabOverflowSuggestion>({
      added: null,
      categories: [],
      id: "",
      name: "",
      readingTime: null,
      summary: "",
      url: ""
    })

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tab-overflow`
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      return (await response.json()) as TabOverflowItem[]
    },
    queryKey: ["tab-overflow"],
    refetchOnWindowFocus: false
  })

  const normalizedItems = (data ?? EMPTY_ITEMS).map(mapItemToSuggestion)
  const tabOverflowCount = normalizedItems.length
  const bookmarkCount = bookmarkedIds.length
  const isCurrentBookmarked = bookmarkedIds.includes(tabOverflowSuggestion.id)
  const readingTimeFilterLabel =
    readingTimeOptions.find(
      (option) => option.value === selectedReadingTimeFilter
    )?.label ?? ""

  const persistBookmarks = (nextBookmarkedIds: string[]) => {
    setBookmarkedIds(nextBookmarkedIds)
    window.localStorage.setItem(
      BOOKMARK_STORAGE_KEY,
      JSON.stringify(nextBookmarkedIds)
    )
  }

  const applySuggestionFromIndex = (index: number) => {
    const item = normalizedItems[index]
    if (item) {
      setTabOverflowSuggestion({ ...item })
    }
  }

  const chooseRandomIndex = () =>
    Math.floor(Math.random() * normalizedItems.length)

  const nextSuggestion = useEffectEvent(() => {
    if (!normalizedItems.length) {
      return
    }

    if (currentIndex < suggestionHistory.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      applySuggestionFromIndex(suggestionHistory[nextIndex])
      return
    }

    let randomIndex = chooseRandomIndex()
    if (suggestionHistory.length > 0 && normalizedItems.length > 1) {
      while (randomIndex === suggestionHistory[suggestionHistory.length - 1]) {
        randomIndex = chooseRandomIndex()
      }
    }

    const nextHistory = [...suggestionHistory, randomIndex]
    setSuggestionHistory(nextHistory)
    setCurrentIndex(nextHistory.length - 1)
    applySuggestionFromIndex(randomIndex)
  })

  const previousSuggestion = useEffectEvent(() => {
    if (currentIndex <= 0) {
      return
    }

    const nextIndex = currentIndex - 1
    setCurrentIndex(nextIndex)
    applySuggestionFromIndex(suggestionHistory[nextIndex])
  })

  const openLink = (url: string) => {
    if (!url || url === "#") {
      return
    }

    window.open(url, "_blank", "noopener")
  }

  const toggleBookmarkById = (id: string) => {
    if (!id) {
      return
    }

    if (bookmarkedIds.includes(id)) {
      persistBookmarks(bookmarkedIds.filter((bookmarkId) => bookmarkId !== id))
    } else {
      persistBookmarks([...bookmarkedIds, id])
    }
  }

  const filteredTableItems = normalizedItems
    .map((item, index) => ({ index, item }))
    .filter(({ item }) =>
      showOnlyBookmarked ? bookmarkedIds.includes(item.id) : true
    )
    .filter(({ item }) => {
      if (selectedReadingTimeFilter === null) {
        return true
      }

      if (typeof item.readingTime !== "number") {
        return false
      }

      return item.readingTime < selectedReadingTimeFilter
    })
    .sort(
      (a, b) => (b.item.added?.getTime() ?? 0) - (a.item.added?.getTime() ?? 0)
    )

  const scrollToSuggestionCard = () => {
    if (!suggestionCardRef.current) {
      window.scrollTo({ behavior: "smooth", top: 0 })
      return
    }

    const rect = suggestionCardRef.current.getBoundingClientRect()
    const viewportCenter = window.innerHeight / 2
    const target = window.scrollY + rect.top + rect.height / 2 - viewportCenter
    window.scrollTo({
      behavior: "smooth",
      top: target > 0 ? target : 0
    })
  }

  const openSuggestionFromTable = (index: number) => {
    if (index < 0 || index >= normalizedItems.length) {
      return
    }

    const nextHistory =
      suggestionHistory[suggestionHistory.length - 1] === index
        ? suggestionHistory
        : [...suggestionHistory, index]

    setSuggestionHistory(nextHistory)
    setCurrentIndex(nextHistory.length - 1)
    applySuggestionFromIndex(index)
    window.requestAnimationFrame(scrollToSuggestionCard)
  }

  useEffect(() => {
    setBookmarkedIds(loadBookmarks())
  }, [])

  useEffect(() => {
    const availableIds = new Set(normalizedItems.map((item) => item.id))
    const filteredBookmarks = bookmarkedIds.filter((id) => availableIds.has(id))
    if (filteredBookmarks.length !== bookmarkedIds.length) {
      persistBookmarks(filteredBookmarks)
    }
  }, [bookmarkedIds, normalizedItems])

  useEffect(() => {
    if (!isLoading && currentIndex === -1 && tabOverflowCount > 0) {
      nextSuggestion()
    }
  }, [currentIndex, isLoading, nextSuggestion, tabOverflowCount])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        previousSuggestion()
      }

      if (event.key === "ArrowRight") {
        nextSuggestion()
      }
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        isReadingTimeFilterOpen &&
        readingTimeFilterRootRef.current &&
        !readingTimeFilterRootRef.current.contains(event.target as Node)
      ) {
        setIsReadingTimeFilterOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeydown)
    document.addEventListener("click", handleDocumentClick)

    return () => {
      window.removeEventListener("keydown", handleKeydown)
      document.removeEventListener("click", handleDocumentClick)
    }
  }, [isReadingTimeFilterOpen, nextSuggestion, previousSuggestion])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden transition-all duration-1000">
      <div className="flex min-h-[calc(100vh-12rem)] shrink-0 flex-col">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 transition-colors duration-1000">
            <div className="w-full">
              <div className="animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-6 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="block h-6 w-20 bg-gray-200 dark:bg-gray-700" />
                  <span className="block h-6 w-16 bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="block h-9 w-28 bg-gray-200 dark:bg-gray-700" />
                  <span className="block h-9 w-28 bg-gray-200 dark:bg-gray-700" />
                  <span className="block h-9 w-32 bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-2 py-8"
            ref={suggestionCardRef}
          >
            <div className="grid w-full grid-cols-[auto_1fr_auto] sm:block">
              <button
                className="flex h-full w-6 cursor-pointer items-center justify-center rounded-none border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:hidden"
                disabled={currentIndex <= 0}
                onClick={previousSuggestion}
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden border-0 bg-transparent">
                <div className="flex h-full w-full min-w-0 flex-col">
                  <header className="flex w-full min-w-0 flex-nowrap items-center gap-4 overflow-hidden">
                    <a
                      className="block min-w-0 flex-1 truncate text-md font-medium lowercase leading-tight text-foreground transition-colors hover:text-primary sm:text-lg"
                      href={tabOverflowSuggestion.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {tabOverflowSuggestion.name}
                    </a>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        className="cursor-pointer rounded-none  bg-secondary p-2 text-foreground transition hover:bg-primary/10 dark:border-zinc-800"
                        onClick={() => openLink(tabOverflowSuggestion.url)}
                        title="open in new tab"
                        type="button"
                      >
                        <ArrowUpRight className="size-4" />
                      </button>

                      <button
                        className={cn(
                          "cursor-pointer rounded-none border p-2 transition",
                          isCurrentBookmarked
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-transparent bg-transparent text-foreground hover:border-primary/40"
                        )}
                        onClick={() =>
                          toggleBookmarkById(tabOverflowSuggestion.id)
                        }
                        title={
                          isCurrentBookmarked
                            ? "remove bookmark"
                            : "save for later"
                        }
                        type="button"
                      >
                        {isCurrentBookmarked ? (
                          <BookmarkCheck className="size-4" />
                        ) : (
                          <Bookmark className="size-4" />
                        )}
                      </button>
                    </div>
                  </header>

                  <section className="min-w-0 py-1">
                    {tabOverflowSuggestion.summary ? (
                      <p className="min-h-[5lh] line-clamp-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {tabOverflowSuggestion.summary}
                      </p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        No summary available for this suggestion yet.
                      </p>
                    )}
                  </section>

                  <footer className="flex min-w-0 flex-col gap-3 py-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-medium text-foreground">
                        reading time:
                      </span>
                      <span>
                        {tabOverflowSuggestion.readingTime
                          ? `${tabOverflowSuggestion.readingTime} minutes`
                          : "Not set"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tabOverflowSuggestion.categories.length ? (
                        tabOverflowSuggestion.categories.map((category) => (
                          <span
                            className="border border-zinc-300 px-2.5 py-1 text-xs font-medium lowercase text-foreground dark:border-zinc-700"
                            key={`${tabOverflowSuggestion.id}-${category}`}
                          >
                            {category}
                          </span>
                        ))
                      ) : (
                        <span className="border border-dashed border-zinc-300 px-2.5 py-1 text-xs">
                          No categories yet
                        </span>
                      )}
                    </div>
                  </footer>
                </div>
              </div>
              <button
                className="flex h-full w-6 cursor-pointer items-center justify-center rounded-none border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground sm:hidden"
                onClick={nextSuggestion}
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                className="hidden cursor-pointer items-center justify-center rounded-none border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                disabled={currentIndex <= 0}
                onClick={previousSuggestion}
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>

              <span className="pointer-events-none font-mono text-[10px] font-semibold tracking-tight text-muted-foreground">
                {currentIndex >= 0 && suggestionHistory.length > 0
                  ? suggestionHistory[currentIndex] + 1
                  : 0}{" "}
                / {tabOverflowCount}
              </span>

              <button
                className="hidden cursor-pointer items-center justify-center rounded-none border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                onClick={nextSuggestion}
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-zinc-300 pt-4 dark:border-zinc-800">
        <div className="flex h-8 flex-wrap items-center justify-between gap-2">
          <button
            className="flex cursor-pointer items-center gap-1 border-0 p-0 text-xs font-semibold hover:text-primary"
            onClick={() => setIsTableVisible((value) => !value)}
            type="button"
          >
            {isTableVisible ? "hide all" : "show all"}
            {isTableVisible ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>

          <div
            className={cn(
              "relative items-center gap-2",
              isTableVisible ? "flex" : "hidden"
            )}
            ref={readingTimeFilterRootRef}
          >
            {readingTimeFilterLabel ? (
              <span className="text-xs text-muted-foreground">
                under {readingTimeFilterLabel}
              </span>
            ) : null}

            <button
              className={cn(
                "cursor-pointer border-0 p-2",
                selectedReadingTimeFilter ? "bg-secondary" : "bg-transparent"
              )}
              onClick={() => setIsReadingTimeFilterOpen((value) => !value)}
              title="filter by read time"
              type="button"
            >
              <Hourglass className="size-4" />
            </button>

            {isReadingTimeFilterOpen ? (
              <div className="absolute right-0 top-full z-10 mt-2 min-w-[160px] rounded-md border border-zinc-300 bg-background/95 p-2 shadow-lg backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <p className="px-1 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  under
                </p>
                <div className="flex flex-col gap-1">
                  {readingTimeOptions.map((option) => (
                    <button
                      className={cn(
                        "cursor-pointer justify-start rounded-sm border-0 bg-transparent px-3 py-2 text-left text-xs capitalize",
                        option.value === selectedReadingTimeFilter
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : ""
                      )}
                      key={option.value}
                      onClick={() => {
                        setSelectedReadingTimeFilter((currentValue) =>
                          currentValue === option.value ? null : option.value
                        )
                        setIsReadingTimeFilterOpen(false)
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              className={cn(
                "cursor-pointer border-0 px-2 py-1 text-xs",
                showOnlyBookmarked ? "bg-secondary" : "bg-transparent"
              )}
              onClick={() => setShowOnlyBookmarked((value) => !value)}
              title="filter by bookmarked"
              type="button"
            >
              <BookmarkCheck className="size-4" />
            </button>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {bookmarkCount} saved
            </span>
          </div>
        </div>
      </div>
      </div>

      {isTableVisible ? (
        <div className="mt-4 overflow-hidden border-zinc-300 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed caption-bottom text-sm">
                <colgroup>
                  <col className="w-[48%]" />
                  <col className="w-[11%]" />
                  <col className="w-[31%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <tbody>
                  {filteredTableItems.length ? (
                    filteredTableItems.map((row) => (
                      <tr
                        className={cn(
                          "cursor-pointer border-b border-zinc-300/90 text-zinc-600 transition-colors hover:bg-zinc-300/80 dark:border-zinc-700/90 dark:text-zinc-400 dark:hover:bg-zinc-900/45",
                          row.item.id === tabOverflowSuggestion.id
                            ? "bg-zinc-200 dark:bg-zinc-900/60"
                            : ""
                        )}
                        key={row.item.id}
                        onClick={() => openSuggestionFromTable(row.index)}
                      >
                        <td className="truncate py-1.5 pr-5 text-sm font-medium lowercase text-zinc-800 dark:text-zinc-300">
                          {row.item.name}
                        </td>
                        <td className="px-2 py-1.5 text-sm">
                          {row.item.readingTime ? (
                            <span>{row.item.readingTime} min</span>
                          ) : (
                            <span className="opacity-70">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 lowercase">
                          <div className="no-scrollbar flex gap-1 overflow-hidden whitespace-nowrap">
                            {row.item.categories.length ? (
                              row.item.categories.map((category, index) => (
                                <span
                                  className="shrink-0 bg-zinc-100 px-3 py-[3px] text-[11px] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                                  key={`${row.item.id}-cat-${index}`}
                                >
                                  {category}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs opacity-70">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-1.5 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              className="cursor-pointer border-0 bg-transparent p-0 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
                              onClick={(event) => {
                                event.stopPropagation()
                                toggleBookmarkById(row.item.id)
                              }}
                              type="button"
                            >
                              {bookmarkedIds.includes(row.item.id) ? (
                                <BookmarkCheck className="size-4" />
                              ) : (
                                <Bookmark className="size-4" />
                              )}
                            </button>

                            <button
                              className="cursor-pointer border-0 bg-transparent p-0 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
                              onClick={(event) => {
                                event.stopPropagation()
                                openLink(row.item.url)
                              }}
                              type="button"
                            >
                              <ArrowUpRight className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-10 text-center" colSpan={4}>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No items to display. Try saving a bookmark first.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
