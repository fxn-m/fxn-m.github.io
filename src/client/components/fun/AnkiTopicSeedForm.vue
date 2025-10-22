<script setup lang="ts">
  import { X } from "lucide-vue-next"
  import { computed } from "vue"

  import { Button } from "@/client/components/ui/button"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"

  const props = withDefaults(
    defineProps<{
      modelValue: string
      isGenerating?: boolean
      error?: string | null
      inputTone: string
      labelTone: string
      showClose?: boolean
      autoFocus?: boolean
    }>(),
    {
      isGenerating: false,
      error: null,
      showClose: false,
      autoFocus: false
    }
  )

  const emit = defineEmits(["update:modelValue", "submit", "close"])

  const topic = computed({
    get: () => props.modelValue,
    set: (value: string) => {
      emit("update:modelValue", value)
    }
  })

  const buttonLabel = computed(() =>
    props.isGenerating ? "Drafting..." : "Generate 5 Cards"
  )

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
    class="relative flex items-end gap-3 bg-white/80 p-10 text-neutral-900 transition-all duration-500 ease-out dark:bg-inherit dark:text-neutral-100"
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
    <div class="grid flex-1 gap-3">
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

    <Button
      variant="default"
      :disabled="isGenerating"
      type="button"
      @click="handleSubmit"
    >
      {{ buttonLabel }}
    </Button>
  </section>
</template>
