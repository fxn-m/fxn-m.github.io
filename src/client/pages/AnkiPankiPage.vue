<script setup lang="ts">
  import { Download } from "lucide-vue-next"
  import { Motion } from "motion-v"
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch
  } from "vue"

  import AnkiApiKeyControl from "@/client/components/fun/AnkiApiKeyControl.vue"
  import AnkiCardEditor from "@/client/components/fun/AnkiCardEditor.vue"
  import AnkiCardSkeleton from "@/client/components/fun/AnkiCardSkeleton.vue"
  import AnkiTopicSeedForm from "@/client/components/fun/AnkiTopicSeedForm.vue"
  import GenerateMoreChip from "@/client/components/fun/GenerateMoreChip.vue"
  import { Button } from "@/client/components/ui/button"
  import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
  } from "@/client/components/ui/carousel"
  import {
    RadioGroup,
    RadioGroupItem
  } from "@/client/components/ui/radio-group"
  import Spinner from "@/client/components/ui/spinner/Spinner.vue"
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
  } from "@/client/components/ui/tooltip"
  import {
    AnkiCardFormats,
    type AnkiGeneratedCard,
    type AnkiTopicSelection,
    type ClozeDefinitionGeneratedCard,
    type EnumeratedListGeneratedCard,
    type GenerateAnkiDeckRequest,
    type QADefinitionGeneratedCard,
    TopicNames
  } from "@/shared/types/anki"

  const API_KEY_STORAGE_KEY = "ankipanki:openai-api-key"
  const MIN_CARD_COUNT = 1
  const MAX_CARD_COUNT = 10
  const DEFAULT_CARD_COUNT = 5
  const SKELETON_STAGGER_MS = 120

  const topicSelection = ref<AnkiTopicSelection>({
    topicName: TopicNames[0],
    subtopic: "",
    cardFormat: AnkiCardFormats[0]
  })
  const cardCount = ref(DEFAULT_CARD_COUNT)
  const cards = ref<AnkiGeneratedCard[]>([])
  const isGenerating = ref(false)
  const isExporting = ref(false)
  const generationError = ref<string | null>(null)
  const regeneratingCardId = ref<string | null>(null)
  const isSeedFormOpen = ref(true)
  const lastGeneratedTopic = ref<string | null>(null)
  const hasDockedOnce = ref(false)
  let carouselEventTeardown: Array<() => void> = []

  const isClozeDefinitionCard = (
    card: AnkiGeneratedCard
  ): card is ClozeDefinitionGeneratedCard =>
    "type" in card && card.type === "cloze_definition"

  const isEnumeratedListCard = (
    card: AnkiGeneratedCard
  ): card is EnumeratedListGeneratedCard =>
    "type" in card && card.type === "enumerated_list"

  const isQADefinitionCard = (
    card: AnkiGeneratedCard
  ): card is QADefinitionGeneratedCard =>
    "type" in card && card.type === "qa_definition"

  type CarouselSlide =
    | { kind: "card"; id: string; position: number; card: AnkiGeneratedCard }
    | { kind: "skeleton"; id: string; position: number; order: number }

  const slides = computed<CarouselSlide[]>(() => {
    const cardSlides = cards.value.map((card, index) => ({
      kind: "card" as const,
      id: card.id,
      position: index,
      card
    }))
    const skeletonSlides = skeletonKeys.value.map((key, skeletonIndex) => ({
      kind: "skeleton" as const,
      id: `skeleton-${key}`,
      position: cards.value.length + skeletonIndex,
      order: skeletonIndex
    }))

    return [...cardSlides, ...skeletonSlides]
  })

  const slideCount = computed(() => slides.value.length)
  const totalDotCount = computed(() =>
    Math.max(cardCount.value, slideCount.value || cardCount.value)
  )

  const activeSlideValue = computed<string>({
    get: () => activeSlideIndex.value.toString(),
    set: (value) => {
      const parsedIndex = Number.parseInt(value, 10)

      if (
        Number.isNaN(parsedIndex) ||
        parsedIndex === activeSlideIndex.value ||
        parsedIndex < 0 ||
        parsedIndex >= slideCount.value
      ) {
        return
      }

      activeSlideIndex.value = parsedIndex

      const api = carouselApi.value

      if (!api || slideCount.value === 0) {
        return
      }

      api.scrollTo(parsedIndex)
    }
  })
  const carouselApi = ref<CarouselApi | null>(null)
  const activeSlideIndex = ref(0)

  const labelTone =
    "text-[10px] uppercase tracking-[0.45em] text-neutral-600 dark:text-neutral-400"
  const footnoteTone =
    "text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-500"
  const inputTone =
    "border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus-visible:border-neutral-400 dark:focus-visible:border-neutral-600 focus-visible:ring-0"

  const skeletonKeys = ref<string[]>([])

  let skeletonTimers: ReturnType<typeof setTimeout>[] = []
  let activeGenerationToken: string | null = null

  const showEmptyState = computed(
    () =>
      !cards.value.length && !skeletonKeys.value.length && !isGenerating.value
  )

  const renderSeedForm = computed(
    () => isSeedFormOpen.value || showEmptyState.value
  )

  const canCloseSeedForm = computed(() => cards.value.length > 0)

  const lastTopic = computed(() => {
    const firstCard = cards.value[0]
    if (firstCard) {
      const topic = safeTrim(firstCard.topic)
      if (topic.length) {
        return topic
      }
    }

    return lastGeneratedTopic.value
  })

  const chipDisabled = computed(
    () => isGenerating.value || skeletonKeys.value.length > 0
  )

  const exportDisabled = computed(
    () => isExporting.value || isGenerating.value || cards.value.length === 0
  )

  const buildTopicLabel = (
    topicName: string,
    subtopic?: string | null
  ): string => {
    const trimmed = subtopic?.trim()
    return trimmed ? `${topicName} — ${trimmed}` : topicName
  }

  const formatTopic = (value: string) => {
    if (value.length <= 40) {
      return value
    }

    return `${value.slice(0, 37)}...`
  }

  const chipDescription = computed(() => {
    if (lastTopic.value) {
      return `Last: ${formatTopic(lastTopic.value)}`
    }

    return "Ready for a new topic"
  })

  const showGenerateChip = computed(
    () => cards.value.length > 0 && !renderSeedForm.value
  )

  const chipLabel = computed(() =>
    chipDisabled.value && isGenerating.value ? "Drafting..." : "Generate More"
  )

  const shouldDockInput = computed(
    () =>
      isGenerating.value ||
      skeletonKeys.value.length > 0 ||
      cards.value.length > 0
  )

  const containerAnimate = computed(() => {
    if (!shouldDockInput.value) {
      return {
        paddingTop: "36px",
        marginBottom: "112px",
        rowGap: "40px"
      }
    }

    if (showGenerateChip.value) {
      return {
        paddingTop: "28px",
        marginBottom: "24px",
        rowGap: "8px"
      }
    }

    return {
      paddingTop: "36px",
      marginBottom: "24px",
      rowGap: "24px"
    }
  })

  const containerTransition = {
    duration: 0.45,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
  }

  const activeContainerTransition = computed(() =>
    hasDockedOnce.value
      ? {
          duration: 0.001,
          ease: [0, 1, 1, 1] as [number, number, number, number]
        }
      : containerTransition
  )

  const uid = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID()
    }
    return Math.random().toString(36).slice(2)
  }

  const clearScheduledWork = () => {
    skeletonTimers.forEach((timer) => clearTimeout(timer))
    skeletonTimers = []
  }

  const openSeedForm = () => {
    if (chipDisabled.value && cards.value.length > 0) {
      return
    }

    isSeedFormOpen.value = true
  }

  const closeSeedForm = () => {
    if (!cards.value.length) {
      return
    }

    isSeedFormOpen.value = false
  }

  const handleSeedShortcut = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    if (event.key.toLowerCase() !== "g") {
      return
    }

    const target = event.target as HTMLElement | null

    if (target) {
      const tag = target.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
        return
      }
    }

    if (showEmptyState.value) {
      isSeedFormOpen.value = true
      return
    }

    event.preventDefault()
    openSeedForm()
  }

  const detachCarouselEvents = () => {
    carouselEventTeardown.forEach((teardown) => teardown())
    carouselEventTeardown = []
  }

  const syncActiveFromApi = (api: CarouselApi) => {
    if (!api) {
      return
    }

    const selected = api.selectedScrollSnap()

    if (typeof selected === "number" && !Number.isNaN(selected)) {
      activeSlideIndex.value = selected
    }
  }

  const handleCarouselInit = (api: CarouselApi) => {
    if (!api) {
      return
    }

    carouselApi.value = api

    detachCarouselEvents()

    const handleSelect = () => {
      syncActiveFromApi(api)
    }

    const handleReInit = () => {
      syncActiveFromApi(api)
    }

    api.on("select", handleSelect)
    api.on("reInit", handleReInit)

    carouselEventTeardown = [
      () => api.off("select", handleSelect),
      () => api.off("reInit", handleReInit)
    ]

    syncActiveFromApi(api)
  }

  onMounted(() => {
    window.addEventListener("keydown", handleSeedShortcut)
  })

  const spawnSkeletons = () => {
    skeletonKeys.value = []
    const targetCount = Math.max(cardCount.value, MIN_CARD_COUNT)

    for (let index = 0; index < targetCount; index += 1) {
      const timer = setTimeout(() => {
        skeletonKeys.value = [...skeletonKeys.value, uid()]
      }, index * SKELETON_STAGGER_MS)
      skeletonTimers.push(timer)
    }
  }

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
      .slice(0, 80)

  const sanitizeForTsv = (value: string | null | undefined) => {
    if (!value) {
      return ""
    }

    return value.replace(/\r?\n/g, "<br>").replace(/\t/g, " ").trim()
  }

  const safeTrim = (value?: string | null) =>
    typeof value === "string" ? value.trim() : ""

  const buildFrontField = (card: AnkiGeneratedCard) => {
    const segments: string[] = []

    const headline = safeTrim(card.headline)
    if (headline.length) {
      segments.push(headline)
    }

    if (isClozeDefinitionCard(card)) {
      const text = safeTrim(card.text)
      if (text.length) {
        segments.push(text)
      }
    } else if (isEnumeratedListCard(card)) {
      const prompt = safeTrim(card.prompt)
      if (prompt.length) {
        segments.push(prompt)
      }
    } else if (isQADefinitionCard(card)) {
      const question = safeTrim(card.question)
      if (question.length) {
        segments.push(question)
      }
    }

    return sanitizeForTsv(segments.join("<br><br>"))
  }

  const buildBackField = (card: AnkiGeneratedCard) => {
    if (isClozeDefinitionCard(card)) {
      const text = safeTrim(card.text)
      return sanitizeForTsv(text)
    }

    if (isEnumeratedListCard(card)) {
      const items = card.items
        .map((item, index) => {
          const label = (card.ordered ?? true) ? `${index + 1}.` : "•"
          const content = safeTrim(item)
          return content.length ? `${label} ${content}` : ""
        })
        .filter((entry) => entry.length)

      return sanitizeForTsv(items.join("<br>"))
    }

    if (isQADefinitionCard(card)) {
      return sanitizeForTsv(safeTrim(card.answer))
    }

    return ""
  }

  const buildExtraField = (card: AnkiGeneratedCard) => {
    const segments: string[] = []

    const topic = safeTrim(card.topic)
    if (topic.length) {
      segments.push(`Topic: ${topic}`)
    }

    if (card.difficulty) {
      segments.push(`Difficulty: ${card.difficulty}`)
    }

    if (isClozeDefinitionCard(card)) {
      segments.push("Format: Cloze Definition")
    } else if (isEnumeratedListCard(card)) {
      segments.push(
        `Format: Enumerated List (${(card.ordered ?? true) ? "ordered" : "unordered"})`
      )
    } else if (isQADefinitionCard(card)) {
      segments.push("Format: Q&A Definition")
    }

    return sanitizeForTsv(segments.join("<br>"))
  }

  const buildTagField = (card: AnkiGeneratedCard) => {
    const tags = new Set<string>()
    const topicTag = slugify(safeTrim(card.topic))

    if (topicTag.length) {
      tags.add(topicTag)
    }

    if (card.difficulty) {
      tags.add(card.difficulty.toLowerCase())
    }

    card.tags?.forEach((tag) => {
      if (typeof tag === "string" && tag.trim().length) {
        tags.add(tag.trim())
      }
    })

    if (isClozeDefinitionCard(card)) {
      tags.add("cloze")
    } else if (isEnumeratedListCard(card)) {
      tags.add("list")
    } else if (isQADefinitionCard(card)) {
      tags.add("qa")
    }

    return Array.from(tags).join(" ")
  }

  const buildTsvDeck = (deck: AnkiGeneratedCard[]) =>
    deck
      .map((card) =>
        [
          buildFrontField(card),
          buildBackField(card),
          buildExtraField(card),
          sanitizeForTsv(buildTagField(card))
        ].join("\t")
      )
      .join("\n")

  const buildExportFilename = () => {
    const base = lastTopic.value?.trim() || "anki-panki"
    const topicSlug = slugify(base) || "anki-panki"
    const count = cards.value.length || DEFAULT_CARD_COUNT
    const dateStamp = new Date().toISOString().slice(0, 10)
    return `${topicSlug}-${count}-cards-${dateStamp}.tsv`
  }

  const handleExportTsv = () => {
    if (exportDisabled.value) {
      return
    }

    isExporting.value = true

    let objectUrl: string | null = null
    let anchor: HTMLAnchorElement | null = null

    try {
      if (typeof window === "undefined") {
        return
      }

      const tsvPayload = buildTsvDeck(cards.value)

      if (!tsvPayload.trim().length) {
        return
      }

      const blob = new Blob([tsvPayload], {
        type: "text/tab-separated-values;charset=utf-8"
      })
      objectUrl = URL.createObjectURL(blob)
      anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = buildExportFilename()
      anchor.style.display = "none"
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      anchor = null
    } finally {
      if (anchor && anchor.parentNode) {
        anchor.parentNode.removeChild(anchor)
      }

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }

      isExporting.value = false
    }
  }

  type ServerGeneratedCard =
    | (Omit<ClozeDefinitionGeneratedCard, "id"> & { id?: string })
    | (Omit<EnumeratedListGeneratedCard, "id"> & { id?: string })
    | (Omit<QADefinitionGeneratedCard, "id"> & { id?: string })

  const normalizeGeneratedCard = (
    card: ServerGeneratedCard,
    request: GenerateAnkiDeckRequest
  ): AnkiGeneratedCard => {
    const topicLabel = buildTopicLabel(
      request.topicName,
      request.subtopic ?? null
    )

    const baseId = card.id
    const id = typeof baseId === "string" && baseId.length ? baseId : uid()

    const common = {
      topic: safeTrim(card.topic) || topicLabel,
      headline: card.headline ?? topicLabel,
      regeneratePrompt: card.regeneratePrompt ?? "",
      tags: Array.isArray(card.tags)
        ? card.tags.filter((tag) => typeof tag === "string" && tag.trim().length)
        : undefined,
      difficulty: card.difficulty
    }

    if (card.type === "cloze_definition") {
      const clozeCard: ClozeDefinitionGeneratedCard = {
        ...card,
        ...common,
        id
      }
      return clozeCard
    }

    if (card.type === "enumerated_list") {
      const items = Array.isArray(card.items) && card.items.length
        ? card.items
        : [""]

      const enumeratedCard: EnumeratedListGeneratedCard = {
        ...card,
        items,
        ordered: card.ordered ?? true,
        ...common,
        id
      }
      return enumeratedCard
    }

    const qaCard: QADefinitionGeneratedCard = {
      ...card,
      ...common,
      id
    }
    return qaCard
  }

  const normalizeGeneratedCards = (
    payload: unknown,
    request: GenerateAnkiDeckRequest
  ): AnkiGeneratedCard[] => {
    if (!payload || typeof payload !== "object") {
      throw new Error("Malformed response from generator")
    }

    const cardsPayload = (payload as { cards?: unknown }).cards

    if (!Array.isArray(cardsPayload) || !cardsPayload.length) {
      throw new Error("No cards returned by generator")
    }

    return cardsPayload.map((card) =>
      normalizeGeneratedCard(card as ServerGeneratedCard, request)
    )
  }

  const handleGenerate = async (request: GenerateAnkiDeckRequest) => {
    generationError.value = null
    const topicLabel = buildTopicLabel(
      request.topicName,
      request.subtopic ?? null
    )

    const hadExistingCards = cards.value.length > 0

    activeSlideIndex.value = 0

    const api = carouselApi.value
    if (api) {
      api.scrollTo(0, true)
    }

    const generationToken = uid()
    activeGenerationToken = generationToken

    clearScheduledWork()
    cards.value = []
    skeletonKeys.value = []
    regeneratingCardId.value = null
    isGenerating.value = true

    spawnSkeletons()

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ankipanki/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(request)
        }
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          typeof payload?.message === "string"
            ? payload.message
            : "Unable to start generation"
        throw new Error(message)
      }

      const payload = await response.json().catch(() => null)

      if (activeGenerationToken !== generationToken) {
        return
      }

      const deck = normalizeGeneratedCards(payload, request)

      clearScheduledWork()
      skeletonKeys.value = []
      cards.value = deck
      lastGeneratedTopic.value = deck[0]?.topic ?? topicLabel
      activeGenerationToken = null
      isGenerating.value = false

      if (hadExistingCards) {
        isSeedFormOpen.value = false
      }
    } catch (error) {
      if (activeGenerationToken !== generationToken) {
        return
      }

      clearScheduledWork()
      skeletonKeys.value = []
      isGenerating.value = false
      activeGenerationToken = null
      const message =
        error instanceof Error ? error.message : "Unable to generate cards"
      generationError.value = message
      console.error(error)
    }
  }

  const handleCardUpdate = (nextCard: AnkiGeneratedCard) => {
    cards.value = cards.value.map((card) =>
      card.id === nextCard.id ? nextCard : card
    )
  }

  const handleRegenerateCard = async (cardId: string) => {
    const currentCard = cards.value.find((card) => card.id === cardId)

    if (!currentCard) {
      return
    }

    const promptSeed = safeTrim(currentCard.regeneratePrompt)
    const request: GenerateAnkiDeckRequest = {
      topicName: topicSelection.value.topicName,
      subtopic: promptSeed.length
        ? promptSeed
        : safeTrim(currentCard.topic) || null,
      cardFormat: currentCard.type,
      cardCount: 1
    }

    regeneratingCardId.value = cardId

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ankipanki/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(request)
        }
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          typeof payload?.message === "string"
            ? payload.message
            : "Unable to regenerate card"
        throw new Error(message)
      }

      const payload = await response.json().catch(() => null)
      const deck = normalizeGeneratedCards(payload, request)
      const nextCard = deck[0]

      if (!nextCard) {
        throw new Error("Regeneration returned no card")
      }

      cards.value = cards.value.map((card) =>
        card.id === cardId
          ? {
              ...nextCard,
              regeneratePrompt: ""
            }
          : card
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to regenerate card"
      generationError.value = message
      console.error(error)
    } finally {
      regeneratingCardId.value = null
    }
  }

  watch(
    () => slides.value.map((slide) => slide.id),
    async () => {
      if (!slides.value.length) {
        activeSlideIndex.value = 0
      }

      const api = carouselApi.value

      if (!api) {
        return
      }

      await nextTick()

      api.reInit()

      if (!slides.value.length) {
        return
      }

      const clampedIndex = Math.min(
        activeSlideIndex.value,
        Math.max(slides.value.length - 1, 0)
      )

      if (clampedIndex !== activeSlideIndex.value) {
        activeSlideIndex.value = clampedIndex
      }

      api.scrollTo(activeSlideIndex.value, true)
    }
  )

  watch(
    () => cards.value.length,
    (nextLength, previousLength) => {
      if (nextLength === 0) {
        isSeedFormOpen.value = true
        return
      }

      if (previousLength === 0 && nextLength > 0) {
        isSeedFormOpen.value = false
      }
    }
  )

  watch(cards, (next) => {
    if (next.length > 0) {
      lastGeneratedTopic.value = next[0]?.topic ?? lastGeneratedTopic.value
    }
  })

  watch(slideCount, (count) => {
    if (count === 0) {
      activeSlideIndex.value = 0
    }
  })

  watch(
    shouldDockInput,
    (next) => {
      if (next && !hasDockedOnce.value) {
        requestAnimationFrame(() => {
          hasDockedOnce.value = true
        })
      }
    },
    { immediate: false }
  )

  onBeforeUnmount(() => {
    clearScheduledWork()
    activeGenerationToken = null
    detachCarouselEvents()
    window.removeEventListener("keydown", handleSeedShortcut)
  })
</script>

<template>
  <Motion
    tag="div"
    :animate="containerAnimate"
    :initial="false"
    :transition="activeContainerTransition"
    class="flex h-full w-full flex-1 flex-col justify-start"
  >
    <AnkiApiKeyControl
      v-if="!shouldDockInput"
      :storage-key="API_KEY_STORAGE_KEY"
      class="absolute right-4 md:bottom-4"
    />

    <div class="relative">
      <div v-if="renderSeedForm">
        <AnkiTopicSeedForm
          v-model="topicSelection"
          v-model:card-count="cardCount"
          :is-generating="isGenerating"
          :error="generationError"
          :label-tone="labelTone"
          :input-tone="inputTone"
          :min-count="MIN_CARD_COUNT"
          :max-count="MAX_CARD_COUNT"
          :show-close="canCloseSeedForm"
          :auto-focus="isSeedFormOpen && cards.length > 0"
          class="mb-2"
          @submit="handleGenerate"
          @close="closeSeedForm"
        />
      </div>
      <div v-else-if="showGenerateChip" class="mb-1 flex justify-end gap-2">
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="outline"
                class="cursor-pointer"
                type="button"
                :disabled="exportDisabled"
                @click="handleExportTsv"
              >
                <Spinner v-if="isExporting" class="size-4" />
                <Download v-else class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export</p>
            </TooltipContent>
          </Tooltip>
          <GenerateMoreChip
            :label="chipLabel"
            :description="chipDescription"
            :disabled="chipDisabled"
            :loading="isGenerating"
            @click="openSeedForm"
          />
        </TooltipProvider>
      </div>
    </div>

    <div v-if="!showEmptyState" class="flex flex-col gap-6">
      <div class="flex justify-center">
        <RadioGroup
          v-model="activeSlideValue"
          aria-label="Select a flashcard"
          class="auto-cols-max grid-flow-col justify-center gap-3"
        >
          <RadioGroupItem
            v-for="dotIndex in totalDotCount"
            :key="`carousel-dot-${dotIndex}`"
            :value="String(dotIndex - 1)"
            :aria-label="`Go to card ${dotIndex}`"
            :disabled="dotIndex - 1 >= slideCount"
            class="size-3 border-neutral-400 transition-colors data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 dark:border-neutral-600 dark:data-[state=checked]:border-neutral-100 dark:data-[state=checked]:bg-neutral-100"
          />
        </RadioGroup>
      </div>

      <Carousel
        class="relative w-full"
        :opts="{ align: 'center', containScroll: 'trimSnaps' }"
        @init-api="handleCarouselInit"
      >
        <CarouselContent class="gap-6 pb-10 md:gap-8">
          <CarouselItem
            v-for="slide in slides"
            :key="slide.id"
            :class="['basis-10/12']"
          >
            <AnkiCardEditor
              v-if="slide.kind === 'card'"
              :card="slide.card"
              :index="slide.position"
              :label-tone="labelTone"
              :input-tone="inputTone"
              :footnote-tone="footnoteTone"
              :regenerating-card-id="regeneratingCardId"
              @update:card="handleCardUpdate"
              @regenerate="handleRegenerateCard"
            />
            <AnkiCardSkeleton v-else :index="slide.order" />
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious class="hidden md:flex" />
        <CarouselNext class="hidden md:flex" />
      </Carousel>
    </div>
  </Motion>
</template>
