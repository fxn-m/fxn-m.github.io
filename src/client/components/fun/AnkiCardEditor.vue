<script setup lang="ts">
import { computed } from "vue"
import { Plus, X } from "lucide-vue-next"

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
import {
  RadioGroup,
  RadioGroupItem
} from "@/client/components/ui/radio-group"
import { Textarea } from "@/client/components/ui/textarea"
import {
  type AnkiGeneratedCard,
  type ClozeDefinitionGeneratedCard,
  type EnumeratedListGeneratedCard,
  type MultipleChoiceGeneratedCard,
  type QADefinitionGeneratedCard
} from "@/shared/types/anki"

import Spinner from "../ui/spinner/Spinner.vue"

const props = defineProps<{
  card: AnkiGeneratedCard
  index: number
  labelTone: string
  inputTone: string
  footnoteTone: string
  regeneratingCardId: string | null
}>()

const emit = defineEmits<{
  (e: "update:card", payload: AnkiGeneratedCard): void
  (e: "regenerate", payload: string): void
}>()

const formatLabels = {
  multiple_choice: "Multiple Choice",
  cloze_definition: "Cloze Definition",
  enumerated_list: "Enumerated List",
  qa_definition: "Q&A Definition"
} as const

type CardFormat = keyof typeof formatLabels

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

const isMultipleChoiceCard = (
  card: AnkiGeneratedCard
): card is MultipleChoiceGeneratedCard =>
  "options" in card && Array.isArray(card.options)

const format = computed<CardFormat>(() => {
  if (isClozeDefinitionCard(props.card)) {
    return "cloze_definition"
  }

  if (isEnumeratedListCard(props.card)) {
    return "enumerated_list"
  }

  if (isQADefinitionCard(props.card)) {
    return "qa_definition"
  }

  return "multiple_choice"
})

const cardHeadline = computed(() => props.card.headline ?? props.card.topic ?? "")
const cardTopic = computed(() => props.card.topic ?? null)
const regeneratePromptValue = computed(() => props.card.regeneratePrompt ?? "")

const isRegenerating = computed(
  () => props.regeneratingCardId === props.card.id
)

const emitCard = (next: AnkiGeneratedCard) => {
  emit("update:card", next)
}

const updateMultipleChoiceCard = (
  updater: (card: MultipleChoiceGeneratedCard) => MultipleChoiceGeneratedCard
) => {
  if (!isMultipleChoiceCard(props.card)) {
    return
  }

  emitCard(updater(props.card))
}

const updateClozeCard = (
  updater: (card: ClozeDefinitionGeneratedCard) => ClozeDefinitionGeneratedCard
) => {
  if (!isClozeDefinitionCard(props.card)) {
    return
  }

  emitCard(updater(props.card))
}

const updateEnumeratedCard = (
  updater: (card: EnumeratedListGeneratedCard) => EnumeratedListGeneratedCard
) => {
  if (!isEnumeratedListCard(props.card)) {
    return
  }

  emitCard(updater(props.card))
}

const updateQaCard = (
  updater: (card: QADefinitionGeneratedCard) => QADefinitionGeneratedCard
) => {
  if (!isQADefinitionCard(props.card)) {
    return
  }

  emitCard(updater(props.card))
}

const handleQuestionInput = (value: string | number) => {
  const nextValue = String(value)

  if (isMultipleChoiceCard(props.card)) {
    updateMultipleChoiceCard((card) => ({
      ...card,
      question: nextValue
    }))
  } else if (isQADefinitionCard(props.card)) {
    updateQaCard((card) => ({
      ...card,
      question: nextValue
    }))
  }
}

const handleExplanationInput = (value: string | number) => {
  if (!isMultipleChoiceCard(props.card)) {
    return
  }

  updateMultipleChoiceCard((card) => ({
    ...card,
    explanation: String(value)
  }))
}

const handleRegeneratePromptInput = (value: string | number) => {
  emitCard({
    ...props.card,
    regeneratePrompt: String(value)
  })
}

const handleOptionTextInput = (optionId: string, value: string | number) => {
  updateMultipleChoiceCard((card) => ({
    ...card,
    options: card.options.map((option) =>
      option.id === optionId ? { ...option, text: String(value) } : option
    )
  }))
}

const handleAnswerChange = (value: string | null) => {
  if (!value || !isMultipleChoiceCard(props.card)) {
    return
  }

  updateMultipleChoiceCard((card) => ({
    ...card,
    answerId: value.toUpperCase()
  }))
}

const handleClozeTextInput = (value: string | number) => {
  updateClozeCard((card) => ({
    ...card,
    text: String(value)
  }))
}

const handleEnumeratedPromptInput = (value: string | number) => {
  updateEnumeratedCard((card) => ({
    ...card,
    prompt: String(value)
  }))
}

const handleEnumeratedItemChange = (
  index: number,
  value: string | number
) => {
  updateEnumeratedCard((card) => {
    const items = [...card.items]
    items[index] = String(value)
    return {
      ...card,
      items
    }
  })
}

const handleEnumeratedItemRemove = (index: number) => {
  updateEnumeratedCard((card) => {
    if (card.items.length <= 1) {
      return {
        ...card,
        items: [""]
      }
    }

    const items = card.items.filter((_, itemIndex) => itemIndex !== index)
    return {
      ...card,
      items
    }
  })
}

const handleEnumeratedAddItem = () => {
  updateEnumeratedCard((card) => ({
    ...card,
    items: [...card.items, ""]
  }))
}

const handleEnumeratedToggleOrdered = () => {
  updateEnumeratedCard((card) => ({
    ...card,
    ordered: !(card.ordered ?? true)
  }))
}

const handleQaAnswerInput = (value: string | number) => {
  updateQaCard((card) => ({
    ...card,
    answer: String(value)
  }))
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
  "flex flex-col gap-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-transparent px-6 py-4"
const cardContentTone =
  "space-y-6 bg-transparent px-6 py-6 text-neutral-700 dark:text-neutral-300"
const cardTitleTone =
  "text-[13px] font-semibold uppercase tracking-[0.32em] text-neutral-900 dark:text-neutral-100"
const cardDescriptionTone =
  "text-[11px] uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-500"
const formatBadgeTone =
  "inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-300"
</script>

<template>
  <Card :class="[cardTone, isRegenerating ? 'card-outline-pulse' : '']">
    <CardHeader :class="cardHeaderTone">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <CardTitle :class="cardTitleTone"> Card {{ index + 1 }} </CardTitle>
          <CardDescription :class="cardDescriptionTone">
            <span v-if="cardHeadline?.length">
              {{ cardHeadline }}
            </span>
            <span v-else>Generated Card</span>
            <span
              v-if="cardTopic"
              class="mt-1 block text-[10px] uppercase tracking-[0.32em] text-neutral-400 dark:text-neutral-500"
            >
              Topic: {{ cardTopic }}
            </span>
          </CardDescription>
        </div>
        <span :class="formatBadgeTone">{{ formatLabels[format] }}</span>
      </div>
    </CardHeader>
    <CardContent :class="cardContentTone">
      <section v-if="format === 'multiple_choice'" class="space-y-5 md:space-y-6">
        <div class="flex flex-col gap-2">
          <Label :for="`question-${card.id}`" :class="labelTone">
            Question
          </Label>
          <Textarea
            :id="`question-${card.id}`"
            :model-value="isMultipleChoiceCard(card) ? card.question : ''"
            :class="[inputTone, 'min-h-[60px]']"
            @update:model-value="handleQuestionInput"
          />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="option in isMultipleChoiceCard(card) ? card.options : []"
            :key="option.id"
            class="flex flex-col gap-2"
          >
            <Label :for="`option-${card.id}-${option.id}`" :class="labelTone">
              Option {{ option.label }}
            </Label>
            <Input
              :id="`option-${card.id}-${option.id}`"
              :model-value="option.text"
              placeholder="Response text"
              :class="inputTone"
              @update:model-value="handleOptionTextInput(option.id, $event)"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label :for="`answer-${card.id}`" :class="labelTone">
            Correct Option
          </Label>
          <RadioGroup
            :id="`answer-${card.id}`"
            :model-value="isMultipleChoiceCard(card) ? card.answerId : ''"
            class="grid w-full max-w-[180px] grid-cols-4 gap-2"
            @update:model-value="handleAnswerChange"
          >
            <div
              v-for="option in isMultipleChoiceCard(card) ? card.options : []"
              :key="option.id"
              class="contents"
            >
              <RadioGroupItem
                :id="`answer-${card.id}-${option.id}`"
                :value="option.label"
                :aria-label="`Option ${option.label}`"
                class="peer sr-only"
              />
              <Label
                :for="`answer-${card.id}-${option.id}`"
                class="flex aspect-square items-center justify-center rounded-xl border font-semibold uppercase transition-all duration-200 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-neutral-800 dark:peer-focus-visible:ring-neutral-200"
                :class="
                  isMultipleChoiceCard(card) && card.answerId === option.label
                    ? 'bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 border-neutral-900 dark:border-neutral-50 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]'
                    : 'bg-white text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                "
              >
                {{ option.label }}
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div v-if="isMultipleChoiceCard(card)" class="flex flex-col gap-2">
          <Label :for="`rationale-${card.id}`" :class="labelTone">
            Rationale
          </Label>
          <Textarea
            :id="`rationale-${card.id}`"
            :model-value="card.explanation"
            :class="[inputTone, 'min-h-[96px]']"
            @update:model-value="handleExplanationInput"
          />
        </div>
      </section>

      <section v-else-if="format === 'cloze_definition'" class="space-y-3 md:space-y-4">
        <div class="flex flex-col gap-2">
          <Label :for="`cloze-${card.id}`" :class="labelTone">
            Cloze Text
          </Label>
          <Textarea
            :id="`cloze-${card.id}`"
            :model-value="isClozeDefinitionCard(card) ? card.text : ''"
            :class="[inputTone, 'min-h-[120px]']"
            placeholder="e.g. The {{c1::Basel III}} framework introduced the {{c2::Liquidity Coverage Ratio}}."
            @update:model-value="handleClozeTextInput"
          />
          <p :class="[footnoteTone, 'text-[10px] tracking-[0.3em]']">
            Wrap hidden spans with
            <span v-pre>{{c1::term}}</span>
            or
            <span class="font-mono" v-pre>&lt;span class='cloze'&gt;</span>.
          </p>
        </div>
      </section>

      <section v-else-if="format === 'enumerated_list'" class="space-y-4">
        <div class="flex flex-col gap-2">
          <Label :for="`prompt-${card.id}`" :class="labelTone">
            Prompt
          </Label>
          <Textarea
            :id="`prompt-${card.id}`"
            :model-value="isEnumeratedListCard(card) ? card.prompt : ''"
            :class="[inputTone, 'min-h-[72px]']"
            placeholder="List the five pillars of ERM maturity"
            @update:model-value="handleEnumeratedPromptInput"
          />
        </div>
        <div class="flex items-center justify-between">
          <Label :class="labelTone">Items</Label>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            class="cursor-pointer"
            @click="handleEnumeratedToggleOrdered"
          >
            {{
              isEnumeratedListCard(card) && (card.ordered ?? true)
                ? 'Ordered'
                : 'Unordered'
            }}
          </Button>
        </div>
        <div class="space-y-3">
          <div
            v-for="(item, itemIndex) in isEnumeratedListCard(card) ? card.items : []"
            :key="`${card.id}-item-${itemIndex}`"
            class="flex items-start gap-2"
          >
            <Textarea
              :id="`item-${card.id}-${itemIndex}`"
              :model-value="item"
              :class="[inputTone, 'min-h-[60px] flex-1']"
              :placeholder="`Item ${itemIndex + 1}`"
              @update:model-value="handleEnumeratedItemChange(itemIndex, $event)"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              class="mt-1 size-8 shrink-0 cursor-pointer"
              :disabled="enumeratedItemCount <= 1"
              @click="handleEnumeratedItemRemove(itemIndex)"
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
            @click="handleEnumeratedAddItem"
          >
            <Plus class="mr-2 size-4" />
            Add Item
          </Button>
        </div>
      </section>

      <section v-else-if="format === 'qa_definition'" class="space-y-5 md:space-y-6">
        <div class="flex flex-col gap-2">
          <Label :for="`qa-question-${card.id}`" :class="labelTone">
            Question
          </Label>
          <Textarea
            :id="`qa-question-${card.id}`"
            :model-value="isQADefinitionCard(card) ? card.question : ''"
            :class="[inputTone, 'min-h-[72px]']"
            placeholder="What does liquidity coverage ratio measure?"
            @update:model-value="handleQuestionInput"
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
            @update:model-value="handleQaAnswerInput"
          />
        </div>
      </section>

      <section v-else class="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        Unsupported card format
      </section>

      <div class="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
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
