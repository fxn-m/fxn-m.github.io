<script setup lang="ts">
  import { Minus, Plus, X } from "lucide-vue-next"
  import { computed } from "vue"

  import { Button } from "@/client/components/ui/button"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"

  const props = withDefaults(
    defineProps<{
      modelValue: string
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
    (e: "update:modelValue", payload: string): void
    (e: "update:cardCount", payload: number): void
    (e: "submit"): void
    (e: "close"): void
  }>()

  const topic = computed({
    get: () => props.modelValue,
    set: (value: string) => {
      emit("update:modelValue", value)
    }
  })

  const clampCount = (value: number) =>
    Math.min(Math.max(value, props.minCount), props.maxCount)

  const count = computed(() => clampCount(props.cardCount))

  const isDecrementDisabled = computed(
    () => props.isGenerating || count.value <= props.minCount
  )

  const isIncrementDisabled = computed(
    () => props.isGenerating || count.value >= props.maxCount
  )

  const buttonLabel = computed(() => {
    if (props.isGenerating) {
      return "Drafting..."
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

  const handleSubmit = () => {
    if (props.isGenerating) {
      return
    }

    emit("submit")
  }

  const handleClose = () => {
    if (!props.showClose) {
      return
    }

    emit("close")
  }
</script>

<template>
  <section
    class="relative flex flex-wrap items-center gap-4 bg-white/80 p-10 text-neutral-900 transition-all duration-500 ease-out dark:bg-inherit dark:text-neutral-100 md:flex-nowrap md:items-end"
    @keydown.esc.prevent.stop="handleClose"
  >
    <Button
      v-if="showClose"
      class="absolute right-4 top-4 size-8"
      variant="ghost"
      size="icon"
      type="button"
      @click="handleClose"
    >
      <X class="size-4" />
      <span class="sr-only">Close topic input</span>
    </Button>
    <div class="grid flex-1 gap-3 min-w-[240px]">
      <div class="flex justify-between">
        <Label for="topic-seed" :class="labelTone">Input Topic</Label>
        <p v-if="error" class="text-xs text-rose-500 dark:text-rose-400">
          {{ error }}
        </p>
      </div>

      <Input
        id="topic-seed"
        v-model="topic"
        :disabled="isGenerating"
        placeholder="e.g. Structured credit desk, counterparty XVA, liquidity risk"
        :class="[inputTone, 'md:flex-1']"
        :autofocus="autoFocus"
        @keydown.enter.prevent="handleSubmit"
        @keydown.esc.prevent="handleClose"
      />
    </div>

    <div class="flex items-center gap-2 md:self-end">
      <Button
        variant="default"
        :disabled="isGenerating"
        type="button"
        @click="handleSubmit"
      >
        {{ buttonLabel }}
      </Button>
      <Button
        variant="outline"
        size="icon"
        type="button"
        class="size-9"
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
        class="size-9"
        :disabled="isIncrementDisabled"
        @click="handleIncrement"
      >
        <Plus class="size-4" />
        <span class="sr-only">Increase card total</span>
      </Button>
    </div>
  </section>
</template>
