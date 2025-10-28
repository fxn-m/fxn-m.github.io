<script setup lang="ts">
  import { useForm } from "@tanstack/vue-form"
  import { Minus, Plus, X } from "lucide-vue-next"
  import { computed, watch } from "vue"
  import { z } from "zod"

  import { Button } from "@/client/components/ui/button"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from "@/client/components/ui/select"
  import {
    ToggleGroup,
    ToggleGroupItem
  } from "@/client/components/ui/toggle-group"
  import {
    type AnkiCardFormat,
    AnkiCardFormats,
    type AnkiTopicSelection,
    type GenerateAnkiDeckRequest,
    TopicNames
  } from "@/shared/types/anki"

  const props = withDefaults(
    defineProps<{
      modelValue: AnkiTopicSelection
      isGenerating?: boolean
      cardCount?: number
      minCount?: number
      maxCount?: number
      error?: string | null
      inputTone: string
      labelTone: string
      showClose?: boolean
      autoFocus?: boolean
    }>(),
    {
      isGenerating: false,
      cardCount: 5,
      minCount: 1,
      maxCount: 10,
      error: null,
      showClose: false,
      autoFocus: false
    }
  )

  const emit = defineEmits<{
    "update:modelValue": [AnkiTopicSelection]
    "update:cardCount": [number]
    submit: [GenerateAnkiDeckRequest]
    close: []
  }>()

  const topicNameOptions = [...TopicNames]
  type TopicNameOption = (typeof TopicNames)[number]

  const ensureTopicOption = (value: string | undefined): TopicNameOption =>
    topicNameOptions.includes(value as TopicNameOption)
      ? (value as TopicNameOption)
      : topicNameOptions[0]

  const cardFormatOptions = [...AnkiCardFormats] as CardFormatOption[]
  type CardFormatOption = AnkiCardFormat

  const ensureCardFormat = (value: string | undefined): CardFormatOption =>
    cardFormatOptions.includes(value as CardFormatOption)
      ? (value as CardFormatOption)
      : cardFormatOptions[0]

  const cardFormatDisplay: Record<
    CardFormatOption,
    { label: string; description: string }
  > = {
    cloze_definition: {
      label: "Cloze",
      description: "Mask key phrases inside context"
    },
    enumerated_list: {
      label: "List",
      description: "Memorize ordered or unordered items"
    },
    qa_definition: {
      label: "Q&A",
      description: "Prompt and answer style definition"
    }
  }

  const formSchema = z.object({
    topicName: z.enum(
      topicNameOptions as [TopicNameOption, ...TopicNameOption[]]
    ),
    cardFormat: z.enum(
      cardFormatOptions as [CardFormatOption, ...CardFormatOption[]]
    ),
    subtopic: z
      .string()
      .max(280, "Subtopic must be 280 characters or fewer")
      .optional()
      .or(z.literal(""))
  })

  type TopicSeedFormValues = z.infer<typeof formSchema>

  const clampCount = (value: number) =>
    Math.min(Math.max(value, props.minCount), props.maxCount)

  const selectionDefaults = (): TopicSeedFormValues => ({
    topicName: ensureTopicOption(props.modelValue?.topicName),
    cardFormat: ensureCardFormat(props.modelValue?.cardFormat),
    subtopic: props.modelValue?.subtopic ?? ""
  })

  const form = useForm({
    defaultValues: selectionDefaults(),
    validators: {
      onSubmit: formSchema
    },
    onSubmit: ({ value, formApi }) => {
      if (props.isGenerating) {
        return
      }

      const trimmedSubtopic = value.subtopic?.trim?.() ?? ""

      if (trimmedSubtopic !== (value.subtopic ?? "")) {
        formApi.setFieldValue("subtopic", trimmedSubtopic, {
          dontUpdateMeta: true,
          dontRunListeners: true,
          dontValidate: true
        })
      }

      const selection: AnkiTopicSelection = {
        topicName: ensureTopicOption(value.topicName),
        cardFormat: ensureCardFormat(value.cardFormat),
        subtopic: trimmedSubtopic
      }

      emitSelectionIfChanged(selection)

      const payload: GenerateAnkiDeckRequest = {
        topicName: selection.topicName,
        cardFormat: selection.cardFormat,
        subtopic: trimmedSubtopic.length > 0 ? trimmedSubtopic : null,
        cardCount: count.value
      }

      emit("submit", payload)
    },
    onSubmitInvalid: () => {
      // errors surface via field meta
    }
  })

  const topicNameValue = form.useStore(
    (state) => state.values.topicName ?? topicNameOptions[0]
  )
  const cardFormatValue = form.useStore(
    (state) => state.values.cardFormat ?? cardFormatOptions[0]
  )
  const subtopicValue = form.useStore((state) => state.values.subtopic ?? "")
  const isSubmitting = form.useStore((state) => state.isSubmitting)

  const normalizedModelSelection = computed<AnkiTopicSelection>(() => ({
    topicName: ensureTopicOption(props.modelValue?.topicName),
    cardFormat: ensureCardFormat(props.modelValue?.cardFormat),
    subtopic: props.modelValue?.subtopic ?? ""
  }))

  const selectionState = computed<AnkiTopicSelection>(() => ({
    topicName: ensureTopicOption(topicNameValue.value),
    cardFormat: ensureCardFormat(cardFormatValue.value),
    subtopic: subtopicValue.value ?? ""
  }))

  const emitSelectionIfChanged = (next: AnkiTopicSelection) => {
    const previous = normalizedModelSelection.value
    if (
      next.topicName !== previous.topicName ||
      next.cardFormat !== previous.cardFormat ||
      next.subtopic !== previous.subtopic
    ) {
      emit("update:modelValue", next)
    }
  }

  watch(
    selectionState,
    (next) => {
      emitSelectionIfChanged(next)
    },
    { immediate: true }
  )

  const count = computed(() => clampCount(props.cardCount))
  const isBusy = computed(() => props.isGenerating || isSubmitting.value)

  const isDecrementDisabled = computed(
    () => isBusy.value || count.value <= props.minCount
  )

  const isIncrementDisabled = computed(
    () => isBusy.value || count.value >= props.maxCount
  )

  const buttonLabel = computed(() => {
    if (props.isGenerating) {
      return "Drafting..."
    }

    if (isSubmitting.value) {
      return "Validating..."
    }

    const total = count.value
    const suffix = total === 1 ? "Card" : "Cards"
    return `Generate ${total} ${suffix}`
  })

  const emitCount = (value: number) => {
    emit("update:cardCount", clampCount(value))
  }

  const handleIncrement = () => {
    if (isIncrementDisabled.value) {
      return
    }

    emitCount(count.value + 1)
  }

  const handleDecrement = () => {
    if (isDecrementDisabled.value) {
      return
    }

    emitCount(count.value - 1)
  }

  const handleClose = () => {
    if (!props.showClose) {
      return
    }

    emit("close")
  }

  watch(
    () => props.modelValue,
    (next) => {
      const nextTopic = ensureTopicOption(next?.topicName)
      if (topicNameValue.value !== nextTopic) {
        form.setFieldValue("topicName", nextTopic, {
          dontUpdateMeta: true,
          dontRunListeners: true,
          dontValidate: true
        })
      }

      const nextFormat = ensureCardFormat(next?.cardFormat)
      if (cardFormatValue.value !== nextFormat) {
        form.setFieldValue("cardFormat", nextFormat, {
          dontUpdateMeta: true,
          dontRunListeners: true,
          dontValidate: true
        })
      }

      const nextSubtopic = next?.subtopic ?? ""
      if (subtopicValue.value !== nextSubtopic) {
        form.setFieldValue("subtopic", nextSubtopic, {
          dontUpdateMeta: true,
          dontRunListeners: true,
          dontValidate: true
        })
      }
    },
    { immediate: true, deep: true }
  )
</script>

<template>
  <form
    class="relative flex flex-col gap-6"
    @submit.prevent="form.handleSubmit()"
    @keydown.esc.prevent.stop="handleClose"
  >
    <Button
      v-if="showClose"
      class="absolute right-0 top-0 size-8 cursor-pointer"
      variant="ghost"
      size="icon"
      type="button"
      @click="handleClose"
    >
      <X class="size-4" />
      <span class="sr-only">Close topic input</span>
    </Button>

    <div class="grid flex-1 gap-4 min-w-[240px]">
      <form.Field name="topicName">
        <template #default="{ field, state }">
          <div class="grid gap-1.5">
            <Label for="topic-name" :class="labelTone">Topic</Label>
            <Select
              :model-value="state.value ?? topicNameOptions[0]"
              :disabled="isBusy"
              @update:modelValue="
                (value) => {
                  const nextValue = ensureTopicOption(String(value))
                  field.handleChange(nextValue)
                }
              "
            >
              <SelectTrigger
                id="topic-name"
                :class="[
                  inputTone,
                  'min-w-0 w-11/12  justify-between cursor-pointer'
                ]"
                :aria-invalid="state.meta.errors?.length ? 'true' : undefined"
                @blur="field.handleBlur"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="min-w-[240px]">
                <SelectItem
                  v-for="option in topicNameOptions"
                  :key="option"
                  :value="option"
                  class="cursor-pointer"
                >
                  {{ option }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="state.meta.errors?.[0]"
              class="text-xs text-rose-500 dark:text-rose-400"
            >
              {{ state.meta.errors[0] }}
            </p>
          </div>
        </template>
      </form.Field>

      <form.Field name="cardFormat">
        <template #default="{ field, state }">
          <div class="grid gap-1.5">
            <Label for="card-format" :class="labelTone">Format</Label>
            <ToggleGroup
              id="card-format"
              type="single"
              :model-value="state.value ?? cardFormatOptions[0]"
              :disabled="isBusy"
              class="flex w-full flex-wrap gap-2"
              :aria-invalid="state.meta.errors?.length ? 'true' : undefined"
              @update:modelValue="
                (value) => {
                  const nextValue = ensureCardFormat(
                    typeof value === 'string' ? value : undefined
                  )
                  field.handleChange(nextValue)
                }
              "
              @focusout="field.handleBlur"
            >
              <ToggleGroupItem
                v-for="option in cardFormatOptions"
                :key="option"
                :value="option"
                :disabled="isBusy"
                class="flex-1 justify-start text-left py-6 cursor-pointer"
              >
                <div class="flex flex-col text-left">
                  <span class="text-sm font-medium">
                    {{ cardFormatDisplay[option].label }}
                  </span>
                  <span
                    class="text-[11px] text-neutral-600 dark:text-neutral-400"
                  >
                    {{ cardFormatDisplay[option].description }}
                  </span>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
            <p
              v-if="state.meta.errors?.[0]"
              class="text-xs text-rose-500 dark:text-rose-400"
            >
              {{ state.meta.errors[0] }}
            </p>
          </div>
        </template>
      </form.Field>

      <form.Field name="subtopic">
        <template #default="{ field, state }">
          <div class="grid gap-3">
            <div class="flex justify-between">
              <Label for="topic-subtopic" :class="labelTone">
                Subtopic (optional)
              </Label>
              <p
                v-if="state.meta.errors?.[0]"
                class="text-xs text-rose-500 dark:text-rose-400"
              >
                {{ state.meta.errors[0] }}
              </p>
            </div>

            <Input
              id="topic-subtopic"
              :model-value="state.value ?? ''"
              :disabled="isBusy"
              placeholder="e.g. Liquidity stress for insurers"
              :class="[inputTone, 'md:flex-1']"
              :aria-invalid="state.meta.errors?.length ? 'true' : undefined"
              :autofocus="autoFocus"
              @update:modelValue="
                (value) => {
                  const nextValue =
                    typeof value === 'string' ? value : String(value ?? '')
                  field.handleChange(nextValue)
                }
              "
              @blur="field.handleBlur"
              @keydown.enter.prevent="form.handleSubmit()"
              @keydown.esc.prevent="handleClose"
            />
          </div>
        </template>
      </form.Field>
    </div>

    <div class="flex items-center gap-2 md:self-end">
      <Button
        variant="outline"
        size="icon"
        type="button"
        class="size-9 cursor-pointer"
        :disabled="isDecrementDisabled"
        @click="handleDecrement"
      >
        <Minus class="size-4" />
        <span class="sr-only">Decrease card total</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        type="button"
        class="size-9 cursor-pointer"
        :disabled="isIncrementDisabled"
        @click="handleIncrement"
      >
        <Plus class="size-4" />
        <span class="sr-only">Increase card total</span>
      </Button>

      <Button
        variant="default"
        type="submit"
        class="cursor-pointer flex-1 dark:bg-neutral-200 dark:hover:bg-neutral-100 px-12"
        :disabled="isBusy"
      >
        {{ buttonLabel }}
      </Button>
    </div>

    <div class="flex justify-end">
      <p v-if="error" class="text-xs text-rose-500 dark:text-rose-400">
        {{ error }}
      </p>
    </div>
  </form>
</template>
