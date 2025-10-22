<script setup lang="ts">
  import { computed } from "vue"
  import { ChevronDown } from "lucide-vue-next"

  import { Button } from "@/client/components/ui/button"
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
  } from "@/client/components/ui/accordion"
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
  } from "@/client/components/ui/card"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"
  import { Textarea } from "@/client/components/ui/textarea"
  import type { Flashcard } from "@/shared/types"

  const props = defineProps<{
    card: Flashcard
    index: number
    labelTone: string
    inputTone: string
    outlineButtonTone: string
    footnoteTone: string
    regeneratingCardId: string | null
  }>()

  const emit = defineEmits<{
    (e: "update:card", payload: Flashcard): void
    (e: "regenerate", payload: string): void
  }>()

  const cardTone =
    "overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-none transition-colors"
  const cardHeaderTone =
    "border-b border-neutral-200 dark:border-neutral-800 bg-transparent p-0"
  const cardContentTone =
    "space-y-6 bg-transparent text-neutral-700 dark:text-neutral-300 py-6"
  const cardFooterTone =
    "flex flex-col gap-1 border-t border-neutral-200 dark:border-neutral-800 bg-transparent py-4 text-neutral-500 dark:text-neutral-400 text-[10px] uppercase tracking-[0.4em]"
  const cardTitleTone =
    "text-sm font-semibold uppercase tracking-[0.4em] text-neutral-900 dark:text-neutral-100"
  const cardDescriptionTone =
    "text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-500"
  const accordionTriggerTone =
    "group w-full rounded-none px-6 py-5 text-left hover:no-underline focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&[data-state=open]>.accordion-caret>svg]:rotate-180"
  const caretButtonTone =
    "accordion-caret pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors duration-200 group-hover:border-neutral-300 group-hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:group-hover:border-neutral-500"

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

  const handleAnswerInput = (value: string | number) => {
    updateCardField("answerId", String(value).toUpperCase())
  }

  const handleRegenerate = () => {
    emit("regenerate", props.card.id)
  }
</script>

<template>
  <Accordion
    type="single"
    collapsible
    :default-value="card.id"
    class="w-full"
  >
    <AccordionItem :value="card.id" class="border-none">
      <Card :class="cardTone">
        <CardHeader :class="cardHeaderTone">
          <AccordionTrigger :class="accordionTriggerTone">
            <div class="flex flex-col gap-2">
              <CardTitle :class="cardTitleTone"> Card {{ index + 1 }} </CardTitle>
              <CardDescription :class="cardDescriptionTone">
                {{ card.headline }}
              </CardDescription>
            </div>
            <template #icon>
              <span :class="caretButtonTone">
                <ChevronDown class="size-4 transition-transform duration-200" />
              </span>
            </template>
          </AccordionTrigger>
        </CardHeader>
        <AccordionContent class="px-0 pb-0 text-base">
          <CardContent :class="cardContentTone">
            <div class="space-y-2">
              <Label :for="`question-${card.id}`" :class="labelTone">
                Question
              </Label>
              <Textarea
                :id="`question-${card.id}`"
                :model-value="card.question"
                :class="[inputTone, 'min-h-[140px]']"
                @update:model-value="handleQuestionInput"
              />
            </div>
            <div class="grid gap-4">
              <div v-for="option in card.options" :key="option.id" class="space-y-2">
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
            <div class="grid gap-2">
              <Label :for="`answer-${card.id}`" :class="labelTone">
                Correct Option
              </Label>
              <Input
                :id="`answer-${card.id}`"
                :model-value="card.answerId"
                maxlength="1"
                placeholder="A"
                :class="[inputTone, 'uppercase']"
                @update:model-value="handleAnswerInput"
              />
            </div>
            <div class="space-y-2">
              <Label :for="`rationale-${card.id}`" :class="labelTone">
                Rationale
              </Label>
              <Textarea
                :id="`rationale-${card.id}`"
                :model-value="card.explanation"
                :class="[inputTone, 'min-h-[120px]']"
                @update:model-value="handleExplanationInput"
              />
            </div>
            <div class="grid gap-2">
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
              <div class="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  :disabled="isRegenerating"
                  :class="outlineButtonTone"
                  @click="handleRegenerate"
                >
                  {{ isRegenerating ? "Re-spinning..." : "Re-generate" }}
                </Button>
                <span v-if="isRegenerating" :class="footnoteTone">
                  Refreshing card
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter :class="cardFooterTone">
            <span>Seed: {{ card.topic }}</span>
            <span>Difficulty: {{ card.difficulty }}</span>
          </CardFooter>
        </AccordionContent>
      </Card>
    </AccordionItem>
  </Accordion>
</template>
