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
  import { BLUEPRINTS } from "@/client/lib/ankiBlueprints"
  import type { Flashcard } from "@/shared/types"
  import {
    AnkiCardFormats,
    type AnkiTopicSelection,
    type GenerateAnkiDeckRequest,
    TopicNames
  } from "@/shared/types/anki"

  type Blueprint = (typeof BLUEPRINTS)[number]

  const API_KEY_STORAGE_KEY = "ankipanki:openai-api-key"
  const MIN_CARD_COUNT = 1
  const MAX_CARD_COUNT = 10
  const DEFAULT_CARD_COUNT = 5
  const SKELETON_STAGGER_MS = 120
  const SIMULATED_FETCH_DELAY_MS = 1000
  const CARD_REVEAL_STAGGER_MS = 220

  const topicSelection = ref<AnkiTopicSelection>({
    topicName: TopicNames[0],
    subtopic: "",
    cardFormat: AnkiCardFormats[0]
  })
  const cardCount = ref(DEFAULT_CARD_COUNT)
  const cards = ref<Flashcard[]>([])
  const isGenerating = ref(false)
  const isExporting = ref(false)
  const generationError = ref<string | null>(null)
  const regeneratingCardId = ref<string | null>(null)
  const isSeedFormOpen = ref(true)
  const lastGeneratedTopic = ref<string | null>(null)
  const hasDockedOnce = ref(false)
  let carouselEventTeardown: Array<() => void> = []

  type CarouselSlide =
    | { kind: "card"; id: string; position: number; card: Flashcard }
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
  let revealTimers: ReturnType<typeof setTimeout>[] = []
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
    if (cards.value.length > 0) {
      return cards.value[0]?.topic ?? null
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
        paddingTop: "112px",
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

  const wait = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms)
    })

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
    revealTimers.forEach((timer) => clearTimeout(timer))
    skeletonTimers = []
    revealTimers = []
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

  const replaceTopic = (value: string, topic: string) =>
    value.replaceAll("{{topic}}", topic)

  const buildCard = (seed: string, blueprint: Blueprint): Flashcard => {
    const topic = seed.trim().length ? seed.trim() : "market risk"

    return {
      id: uid(),
      topic,
      headline: replaceTopic(blueprint.headline, topic),
      question: replaceTopic(blueprint.question, topic),
      options: blueprint.options.map(
        (option: Blueprint["options"][number]) => ({
          id: uid(),
          label: option.label,
          text: replaceTopic(option.text, topic)
        })
      ),
      answerId: blueprint.answerId,
      explanation: replaceTopic(blueprint.explanation, topic),
      difficulty: blueprint.difficulty,
      regeneratePrompt: ""
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

  const formatOptionsList = (options: Flashcard["options"]) => {
    if (!options?.length) {
      return ""
    }

    return options
      .map((option) => `${option.label}. ${option.text}`)
      .join("<br>")
  }

  const buildFrontField = (card: Flashcard) => {
    const segments: string[] = []

    const headline = card.headline.trim()
    if (headline.length) {
      segments.push(headline)
    }

    const question = card.question.trim()
    if (question.length) {
      segments.push(question)
    }

    const optionsList = formatOptionsList(card.options)
    if (optionsList.length) {
      segments.push(optionsList)
    }

    return sanitizeForTsv(segments.join("<br><br>"))
  }

  const buildBackField = (card: Flashcard) => {
    const segments: string[] = []
    const answerOption = card.options.find(
      (option) => option.id === card.answerId || option.label === card.answerId
    )

    if (answerOption) {
      segments.push(
        `Answer: ${answerOption.label}. ${answerOption.text}`.trim()
      )
    } else {
      const fallbackAnswerId = card.answerId.trim()
      if (fallbackAnswerId.length) {
        segments.push(`Answer: ${fallbackAnswerId}`)
      }
    }

    const explanation = card.explanation.trim()
    if (explanation.length) {
      segments.push(explanation)
    }

    return sanitizeForTsv(segments.join("<br><br>"))
  }

  const buildExtraField = (card: Flashcard) => {
    const segments: string[] = []

    const topic = card.topic.trim()
    if (topic.length) {
      segments.push(`Topic: ${topic}`)
    }

    if (card.difficulty) {
      segments.push(`Difficulty: ${card.difficulty}`)
    }

    return sanitizeForTsv(segments.join("<br>"))
  }

  const buildTagField = (card: Flashcard) => {
    const tags: string[] = []
    const topicTag = slugify(card.topic.trim())

    if (topicTag.length) {
      tags.push(topicTag)
    }

    if (card.difficulty) {
      tags.push(card.difficulty.toLowerCase())
    }

    return tags.join(" ")
  }

  const buildTsvDeck = (deck: Flashcard[]) =>
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

  const createDeck = (topicLabel: string): Flashcard[] => {
    return Array.from({ length: cardCount.value }, (_, index) => {
      const rotation =
        (index + Math.floor(Math.random() * BLUEPRINTS.length)) %
        BLUEPRINTS.length
      return buildCard(topicLabel, BLUEPRINTS[rotation])
    })
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
    } catch (error) {
      clearScheduledWork()
      skeletonKeys.value = []
      isGenerating.value = false
      activeGenerationToken = null
      generationError.value =
        error instanceof Error ? error.message : "Unable to start generation"
      return
    }

    if (hadExistingCards) {
      isSeedFormOpen.value = false
    }

    spawnSkeletons()

    void (async () => {
      try {
        await wait(SIMULATED_FETCH_DELAY_MS)

        if (activeGenerationToken !== generationToken) {
          return
        }

        const deck = createDeck(topicLabel)

        if (!deck.length) {
          clearScheduledWork()
          isGenerating.value = false
          skeletonKeys.value = []
          activeGenerationToken = null
          return
        }

        lastGeneratedTopic.value = deck[0]?.topic ?? topicLabel

        deck.forEach((card, index) => {
          const timer = setTimeout(() => {
            if (activeGenerationToken !== generationToken) {
              return
            }

            cards.value = [...cards.value, card]
            skeletonKeys.value = skeletonKeys.value.slice(1)

            if (index === deck.length - 1) {
              clearScheduledWork()
              isGenerating.value = false
              skeletonKeys.value = []
              activeGenerationToken = null
            }
          }, index * CARD_REVEAL_STAGGER_MS)

          revealTimers.push(timer)
        })
      } catch (error) {
        if (activeGenerationToken !== generationToken) {
          return
        }

        generationError.value = "Could not sketch the deck. Try again."
        console.error(error)
        clearScheduledWork()
        isGenerating.value = false
        skeletonKeys.value = []
        activeGenerationToken = null
      }
    })()
  }

  const handleCardUpdate = (nextCard: Flashcard) => {
    cards.value = cards.value.map((card) =>
      card.id === nextCard.id ? nextCard : card
    )
  }

  const handleRegenerateCard = async (cardId: string) => {
    const currentCard = cards.value.find((card) => card.id === cardId)

    if (!currentCard) {
      return
    }

    const seed = currentCard.regeneratePrompt.trim() || currentCard.topic

    regeneratingCardId.value = cardId

    try {
      await wait(500)
      const replacements = createDeck(seed)
      const nextCard =
        replacements[Math.floor(Math.random() * replacements.length)]

      cards.value = cards.value.map((card) =>
        card.id === cardId
          ? {
              ...nextCard,
              regeneratePrompt: ""
            }
          : card
      )
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
