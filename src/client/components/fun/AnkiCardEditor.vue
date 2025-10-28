<script setup lang="ts">
  import { Plus, X } from "lucide-vue-next"
  import { computed } from "vue"

  import { Button } from "@/client/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from "@/client/components/ui/card"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"
  import { Textarea } from "@/client/components/ui/textarea"
  import type {
    AnkiGeneratedCard,
    ClozeDefinitionGeneratedCard,
    EnumeratedListGeneratedCard,
    QADefinitionGeneratedCard
  } from "@/shared/types/anki"

  import Spinner from "../ui/spinner/Spinner.vue"

  type ClozeCard = ClozeDefinitionGeneratedCard
  type EnumeratedCard = EnumeratedListGeneratedCard
  type QACard = QADefinitionGeneratedCard

  const props = defineProps<{
    card: AnkiGeneratedCard
    index: number
    labelTone: string
    inputTone: string
    footnoteTone: string
    regeneratingCardId: string | null
  }>()

  const emit = defineEmits<{
    "update:card": [AnkiGeneratedCard]
    regenerate: [string]
  }>()

  const formatLabels = {
    cloze_definition: "Cloze Definition",
    enumerated_list: "Enumerated List",
    qa_definition: "Q&A Definition"
  } as const

  type CardFormat = keyof typeof formatLabels

  const isClozeDefinitionCard = (card: AnkiGeneratedCard): card is ClozeCard =>
    card.type === "cloze_definition"

  const isEnumeratedListCard = (
    card: AnkiGeneratedCard
  ): card is EnumeratedCard => card.type === "enumerated_list"

  const isQADefinitionCard = (card: AnkiGeneratedCard): card is QACard =>
    card.type === "qa_definition"

  const format = computed<CardFormat>(() => props.card.type)

  const cardHeadline = computed(
    () => props.card.headline ?? props.card.topic ?? ""
  )
  const cardTopic = computed(() => props.card.topic ?? null)
  const regeneratePromptValue = computed(
    () => props.card.regeneratePrompt ?? ""
  )

  const isRegenerating = computed(
    () => props.regeneratingCardId === props.card.id
  )

  const emitCard = (next: AnkiGeneratedCard) => {
    emit("update:card", next)
  }

  const updateClozeText = (value: string | number) => {
    if (!isClozeDefinitionCard(props.card)) {
      return
    }

    const next: ClozeCard = {
      ...props.card,
      text: String(value)
    }

    emitCard(next)
  }

  const ensureEnumeratedItems = (card: EnumeratedCard) =>
    card.items.length > 0 ? card.items : [""]

  const updateEnumeratedPrompt = (value: string | number) => {
    if (!isEnumeratedListCard(props.card)) {
      return
    }

    const next: EnumeratedCard = {
      ...props.card,
      prompt: String(value),
      items: ensureEnumeratedItems(props.card)
    }

    emitCard(next)
  }

  const updateEnumeratedItem = (index: number, value: string | number) => {
    if (!isEnumeratedListCard(props.card)) {
      return
    }

    const items = [...ensureEnumeratedItems(props.card)]
    items[index] = String(value)

    const next: EnumeratedCard = {
      ...props.card,
      items
    }

    emitCard(next)
  }

  const removeEnumeratedItem = (index: number) => {
    if (!isEnumeratedListCard(props.card)) {
      return
    }

    const currentItems = ensureEnumeratedItems(props.card)
    if (currentItems.length <= 1) {
      const next: EnumeratedCard = {
        ...props.card,
        items: [""]
      }
      emitCard(next)
      return
    }

    const items = currentItems.filter((_, itemIndex) => itemIndex !== index)
    const next: EnumeratedCard = {
      ...props.card,
      items
    }

    emitCard(next)
  }

  const addEnumeratedItem = () => {
    if (!isEnumeratedListCard(props.card)) {
      return
    }

    const next: EnumeratedCard = {
      ...props.card,
      items: [...ensureEnumeratedItems(props.card), ""]
    }

    emitCard(next)
  }

  const toggleEnumeratedOrdering = () => {
    if (!isEnumeratedListCard(props.card)) {
      return
    }

    const next: EnumeratedCard = {
      ...props.card,
      ordered: !(props.card.ordered ?? true)
    }

    emitCard(next)
  }

  const updateQuestion = (value: string | number) => {
    if (!isQADefinitionCard(props.card)) {
      return
    }

    const next: QACard = {
      ...props.card,
      question: String(value)
    }

    emitCard(next)
  }

  const updateAnswer = (value: string | number) => {
    if (!isQADefinitionCard(props.card)) {
      return
    }

    const next: QACard = {
      ...props.card,
      answer: String(value)
    }

    emitCard(next)
  }

  const handleRegeneratePromptInput = (value: string | number) => {
    emitCard({
      ...props.card,
      regeneratePrompt: String(value)
    })
  }

  const handleRegenerate = () => {
    emit("regenerate", props.card.id)
  }

  const enumeratedItemCount = computed(() =>
    isEnumeratedListCard(props.card) ? props.card.items.length : 0
  )

  const cardTone =
    "overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-none transition-colors"
  const cardHeaderTone =
    "gap-1 border-b border-neutral-200 dark:border-neutral-800 bg-transparent px-6 py-4 w-full"
  const cardContentTone =
    "space-y-6 bg-transparent px-6 py-6 text-neutral-700 dark:text-neutral-300"
  const cardTitleTone =
    "text-[13px] font-semibold uppercase tracking-[0.32em] text-neutral-900 dark:text-neutral-100"
  const cardDescriptionTone =
    "text-[11px] uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-500 max-w-[400px]"
  const formatBadgeTone =
    "inline-flex  items-center rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-300"
</script>

<template>
  <Card :class="[cardTone, isRegenerating ? 'card-outline-pulse' : '']">
    <CardHeader :class="cardHeaderTone">
      <div class="flex items-start justify-between gap-4 w-full">
        <div class="flex flex-col gap-1.5">
          <CardTitle :class="cardTitleTone">
            {{ cardHeadline?.length ? cardHeadline : `Card ${index + 1}` }}
          </CardTitle>
          <CardDescription :class="cardDescriptionTone">
            <span>
              Topic:
              {{ cardTopic?.length ? cardTopic : "Not set" }}
            </span>
          </CardDescription>
        </div>
        <span :class="formatBadgeTone">{{ formatLabels[format] }}</span>
      </div>
    </CardHeader>
    <CardContent :class="cardContentTone">
      <section
        v-if="format === 'cloze_definition'"
        class="space-y-3 md:space-y-4"
      >
        <div class="flex flex-col gap-2">
          <Label :for="`cloze-${card.id}`" :class="labelTone">
            Cloze Text
          </Label>
          <Textarea
            :id="`cloze-${card.id}`"
            :model-value="isClozeDefinitionCard(card) ? card.text : ''"
            :class="[inputTone, 'min-h-[120px]']"
            placeholder="In FRM, {{c1::risk}} is ..."
            @update:model-value="updateClozeText"
          />
          <p :class="[footnoteTone, 'text-[10px] tracking-[0.3em]']">
            Wrap hidden spans with <span v-pre>{{ c1::term }}</span>
          </p>
        </div>
      </section>

      <section v-else-if="format === 'enumerated_list'" class="space-y-4">
        <div class="flex flex-col gap-2">
          <Label :for="`prompt-${card.id}`" :class="labelTone"> Prompt </Label>
          <Textarea
            :id="`prompt-${card.id}`"
            :model-value="isEnumeratedListCard(card) ? card.prompt : ''"
            :class="[inputTone, 'min-h-[72px]']"
            placeholder="List the five components of ..."
            @update:model-value="updateEnumeratedPrompt"
          />
        </div>
        <div class="flex items-center justify-between">
          <Label :class="labelTone">Items</Label>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            class="cursor-pointer"
            @click="toggleEnumeratedOrdering"
          >
            {{
              isEnumeratedListCard(card) && (card.ordered ?? true)
                ? "Ordered"
                : "Unordered"
            }}
          </Button>
        </div>
        <div class="space-y-3">
          <div
            v-for="(item, itemIndex) in isEnumeratedListCard(card)
              ? card.items
              : []"
            :key="`${card.id}-item-${itemIndex}`"
            class="flex items-start gap-2"
          >
            <Textarea
              :id="`item-${card.id}-${itemIndex}`"
              :model-value="item"
              :class="[inputTone, 'min-h-[60px] flex-1']"
              :placeholder="`Item ${itemIndex + 1}`"
              @update:model-value="
                (value) => updateEnumeratedItem(itemIndex, value)
              "
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              class="mt-1 size-8 shrink-0 cursor-pointer"
              :disabled="enumeratedItemCount <= 1"
              @click="removeEnumeratedItem(itemIndex)"
            >
              <X class="size-4" />
              <span class="sr-only">Remove item</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            class="cursor-pointer"
            @click="addEnumeratedItem"
          >
            <Plus class="mr-2 size-4" />
            Add Item
          </Button>
        </div>
      </section>

      <section
        v-else-if="format === 'qa_definition'"
        class="space-y-5 md:space-y-6"
      >
        <div class="flex flex-col gap-2">
          <Label :for="`qa-question-${card.id}`" :class="labelTone">
            Question
          </Label>
          <Textarea
            :id="`qa-question-${card.id}`"
            :model-value="isQADefinitionCard(card) ? card.question : ''"
            :class="[inputTone, 'min-h-[72px]']"
            placeholder="What does liquidity coverage ratio measure?"
            @update:model-value="updateQuestion"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label :for="`qa-answer-${card.id}`" :class="labelTone">
            Answer
          </Label>
          <Textarea
            :id="`qa-answer-${card.id}`"
            :model-value="isQADefinitionCard(card) ? card.answer : ''"
            :class="[inputTone, 'min-h-[96px]']"
            placeholder="It compares HQLA to projected net cash outflows over 30 days."
            @update:model-value="updateAnswer"
          />
        </div>
      </section>

      <section
        v-else
        class="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
      >
        Unsupported card format
      </section>

      <div
        class="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
      >
        <div class="flex flex-col gap-2">
          <Label :for="`regen-${card.id}`" :class="labelTone">
            Re-spin prompt
          </Label>
          <Input
            :id="`regen-${card.id}`"
            :model-value="regeneratePromptValue"
            placeholder="e.g. CCAR wholesale lending scenario"
            :class="inputTone"
            @update:model-value="handleRegeneratePromptInput"
          />
        </div>
        <div class="flex flex-col gap-1 md:items-end">
          <Button
            variant="outline"
            size="sm"
            type="button"
            :disabled="isRegenerating"
            class="cursor-pointer"
            @click="handleRegenerate"
          >
            <span v-if="isRegenerating" class="flex items-center gap-2">
              Re-generating
              <Spinner />
            </span>
            <span v-else>Re-generate</span>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
  .card-outline-pulse {
    animation: card-outline-pulse 1.3s ease-in-out infinite;
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.35);
  }

  @keyframes card-outline-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.35);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.18);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card-outline-pulse {
      animation: none;
    }
  }
</style>
