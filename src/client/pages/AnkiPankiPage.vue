<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from "vue"

  import AnkiApiKeyControl from "@/client/components/fun/AnkiApiKeyControl.vue"
  import AnkiCardEditor from "@/client/components/fun/AnkiCardEditor.vue"
  import AnkiCardSkeleton from "@/client/components/fun/AnkiCardSkeleton.vue"
  import { Button } from "@/client/components/ui/button"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"
  import { type Blueprint, BLUEPRINTS } from "@/client/lib/ankiBlueprints"
  import type { Flashcard } from "@/shared/types"

  const API_KEY_STORAGE_KEY = "ankipanki:openai-api-key"

  const topicSeed = ref("")
  const cards = ref<Flashcard[]>([])
  const isGenerating = ref(false)
  const generationError = ref<string | null>(null)
  const regeneratingCardId = ref<string | null>(null)

  const labelTone =
    "text-[10px] uppercase tracking-[0.45em] text-neutral-600 dark:text-neutral-400"
  const footnoteTone =
    "text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-500"
  const inputTone =
    "border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus-visible:border-neutral-400 dark:focus-visible:border-neutral-600 focus-visible:ring-0"
  const primaryButtonTone =
    "border border-neutral-900/20 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:border-neutral-100/40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
  const outlineButtonTone =
    "border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/60"

  const CARD_COUNT = 5
  const SKELETON_STAGGER_MS = 120
  const SIMULATED_FETCH_DELAY_MS = 10000
  const CARD_REVEAL_STAGGER_MS = 220

  const skeletonKeys = ref<string[]>([])

  let skeletonTimers: ReturnType<typeof setTimeout>[] = []
  let revealTimers: ReturnType<typeof setTimeout>[] = []
  let activeGenerationToken: string | null = null

  const showEmptyState = computed(
    () =>
      !cards.value.length && !skeletonKeys.value.length && !isGenerating.value
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

  const spawnSkeletons = () => {
    skeletonKeys.value = []
    for (let index = 0; index < CARD_COUNT; index += 1) {
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
      options: blueprint.options.map((option) => ({
        id: uid(),
        label: option.label,
        text: replaceTopic(option.text, topic)
      })),
      answerId: blueprint.answerId,
      explanation: replaceTopic(blueprint.explanation, topic),
      difficulty: blueprint.difficulty,
      regeneratePrompt: ""
    }
  }

  const createDeck = (seed: string): Flashcard[] => {
    return Array.from({ length: CARD_COUNT }, (_, index) => {
      const rotation =
        (index + Math.floor(Math.random() * BLUEPRINTS.length)) %
        BLUEPRINTS.length
      return buildCard(seed, BLUEPRINTS[rotation])
    })
  }

  const handleGenerate = async () => {
    generationError.value = null
    const seed = topicSeed.value.trim()

    if (!seed.length) {
      generationError.value = "Input must not be empty"
      return
    }

    const generationToken = uid()
    activeGenerationToken = generationToken

    clearScheduledWork()
    cards.value = []
    skeletonKeys.value = []
    regeneratingCardId.value = null
    isGenerating.value = true

    spawnSkeletons()

    void (async () => {
      try {
        await wait(SIMULATED_FETCH_DELAY_MS)

        if (activeGenerationToken !== generationToken) {
          return
        }

        const deck = createDeck(seed)

        if (!deck.length) {
          clearScheduledWork()
          isGenerating.value = false
          skeletonKeys.value = []
          activeGenerationToken = null
          return
        }

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

  onBeforeUnmount(() => {
    clearScheduledWork()
    activeGenerationToken = null
  })
</script>

<template>
  <div
    class="relative justify-center flex h-full w-full flex-1 flex-col gap-10 mb-16"
  >
    <AnkiApiKeyControl
      :storage-key="API_KEY_STORAGE_KEY"
      class="absolute right-0 md:top-4"
    />
    <section
      class="relative flex gap-3 border-b items-end border-neutral-200/70 bg-white/80 p-10 text-neutral-900 dark:border-neutral-800/70 dark:bg-inherit dark:text-neutral-100"
    >
      <div class="grid gap-3 flex-1">
        <div class="flex justify-between">
          <Label for="topic-seed" :class="labelTone">Input Topic</Label>
          <p
            v-if="generationError"
            class="text-xs text-rose-500 dark:text-rose-400"
          >
            {{ generationError }}
          </p>
        </div>

        <Input
          id="topic-seed"
          v-model="topicSeed"
          :disabled="isGenerating"
          placeholder="e.g. Structured credit desk, counterparty XVA, liquidity risk"
          :class="[inputTone, 'md:flex-1']"
        />
      </div>

      <Button
        variant="outline"
        :class="[primaryButtonTone, 'md:w-fit']"
        :disabled="isGenerating"
        type="button"
        @click="handleGenerate"
      >
        {{ isGenerating ? "Drafting..." : "Generate 5 Cards" }}
      </Button>
    </section>

    <div
      v-if="showEmptyState"
      class="flex flex-col items-center gap-4 text-neutral-500 dark:text-neutral-400"
    >
      <span class="text-[11px] uppercase tracking-[0.6em]"> No cards yet </span>
      <p
        class="max-w-sm text-center text-xs text-neutral-500 dark:text-neutral-400"
      >
        Input a topic to generate five multiple-choice flashcards. You can tweak
        them and export them to anki.
      </p>
    </div>

    <div v-else class="grid gap-8">
      <AnkiCardEditor
        v-for="(card, index) in cards"
        :key="card.id"
        :card="card"
        :index="index"
        :label-tone="labelTone"
        :input-tone="inputTone"
        :outline-button-tone="outlineButtonTone"
        :footnote-tone="footnoteTone"
        :regenerating-card-id="regeneratingCardId"
        @update:card="handleCardUpdate"
        @regenerate="handleRegenerateCard"
      />
      <AnkiCardSkeleton
        v-for="(skeletonKey, skeletonIndex) in skeletonKeys"
        :key="`skeleton-${skeletonKey}`"
        :index="skeletonIndex"
      />
    </div>
  </div>
</template>
