<script setup lang="ts">
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
  import {
    RadioGroup,
    RadioGroupItem
  } from "@/client/components/ui/radio-group"
  import { Textarea } from "@/client/components/ui/textarea"
  import type { Flashcard } from "@/shared/types"

  import Spinner from "../ui/spinner/Spinner.vue"

  const props = defineProps<{
    card: Flashcard
    index: number
    labelTone: string
    inputTone: string
    footnoteTone: string
    regeneratingCardId: string | null
  }>()

  const emit = defineEmits<{
    (e: "update:card", payload: Flashcard): void
    (e: "regenerate", payload: string): void
  }>()

  const cardTone =
    "overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-none transition-colors"
  const cardHeaderTone =
    "flex flex-col gap-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-transparent px-6 py-4"
  const cardContentTone =
    "space-y-5 md:space-y-6 bg-transparent px-6 py-6 text-neutral-700 dark:text-neutral-300"
  const cardTitleTone =
    "text-[13px] font-semibold uppercase tracking-[0.32em] text-neutral-900 dark:text-neutral-100"
  const cardDescriptionTone =
    "text-[11px] uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-500"

  const isRegenerating = computed(
    () => props.regeneratingCardId === props.card.id
  )

  const updateCardField = <K extends keyof Flashcard>(
    key: K,
    value: Flashcard[K]
  ) => {
    emit("update:card", {
      ...props.card,
      [key]: value
    })
  }

  const updateOptionText = (optionId: string, text: string) => {
    updateCardField(
      "options",
      props.card.options.map((option) =>
        option.id === optionId ? { ...option, text } : option
      )
    )
  }

  const handleOptionTextInput = (optionId: string, value: string | number) => {
    updateOptionText(optionId, String(value))
  }

  const handleQuestionInput = (value: string | number) => {
    updateCardField("question", String(value))
  }

  const handleExplanationInput = (value: string | number) => {
    updateCardField("explanation", String(value))
  }

  const handleRegeneratePromptInput = (value: string | number) => {
    updateCardField("regeneratePrompt", String(value))
  }

  const handleAnswerChange = (value: string | null) => {
    if (!value) {
      return
    }

    updateCardField("answerId", value.toUpperCase())
  }

  const handleRegenerate = () => {
    emit("regenerate", props.card.id)
  }
</script>

<template>
  <Card :class="[cardTone, isRegenerating ? 'card-outline-pulse' : '']">
    <CardHeader :class="cardHeaderTone">
      <CardTitle :class="cardTitleTone"> Card {{ index + 1 }} </CardTitle>
      <CardDescription :class="cardDescriptionTone">
        {{ card.headline }}
      </CardDescription>
    </CardHeader>
    <CardContent :class="cardContentTone">
      <div class="flex flex-col gap-2">
        <Label :for="`question-${card.id}`" :class="labelTone">
          Question
        </Label>
        <Textarea
          :id="`question-${card.id}`"
          :model-value="card.question"
          :class="[inputTone, 'min-h-[60px]']"
          @update:model-value="handleQuestionInput"
        />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="option in card.options"
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
          :model-value="card.answerId"
          class="grid w-full max-w-[180px] grid-cols-4 gap-2"
          @update:model-value="handleAnswerChange"
        >
          <div v-for="option in card.options" :key="option.id" class="contents">
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
                card.answerId === option.label
                  ? 'bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 border-neutral-900 dark:border-neutral-50 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]'
                  : 'bg-white text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
              "
            >
              {{ option.label }}
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div class="flex flex-col gap-2">
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
      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div class="flex flex-col gap-2">
          <Label :for="`prompt-${card.id}`" :class="labelTone">
            Re-spin prompt
          </Label>
          <Input
            :id="`prompt-${card.id}`"
            :model-value="card.regeneratePrompt"
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
            @click="handleRegenerate"
          >
            <span v-if="isRegenerating" class="flex gap-2 items-center"
              >Re-generating <Spinner />
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
