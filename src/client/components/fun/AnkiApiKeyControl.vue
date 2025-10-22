<script setup lang="ts">
  import { AlertCircle, Check, Key } from "lucide-vue-next"
  import { computed, nextTick, onMounted, ref, watch } from "vue"
  import { z } from "zod"

  import { Input } from "@/client/components/ui/input"

  import Button from "../ui/button/Button.vue"

  const props = defineProps<{
    storageKey: string
    class?: string
  }>()

  const apiKey = ref("")
  const isExpanded = ref(false)
  const inputRef = ref<HTMLInputElement | null>(null)

  const apiKeySchema = z
    .string()
    .regex(
      /^sk-[A-Za-z0-9_-]{20,}$/,
      "API keys should start with sk- and include at least 20 characters"
    )

  const trimmedKey = computed(() => apiKey.value.trim())
  const apiKeyValid = computed(
    () => apiKeySchema.safeParse(trimmedKey.value).success
  )

  const focusInput = async () => {
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  }

  const toggleField = async () => {
    isExpanded.value = !isExpanded.value
    if (isExpanded.value) {
      await focusInput()
      return
    }
    inputRef.value?.blur()
  }

  const handleBlur = (event: FocusEvent) => {
    const related = event.relatedTarget as HTMLElement | null
    if (related && related.closest("[data-api-key-zone]")) {
      return
    }
    isExpanded.value = false
  }

  watch(apiKey, (value) => {
    if (typeof window === "undefined") {
      return
    }
    const trimmed = value.trim()
    if (!trimmed.length) {
      window.localStorage.removeItem(props.storageKey)
      if (value.length && trimmed !== value) {
        apiKey.value = trimmed
      }
      return
    }
    if (trimmed !== value) {
      apiKey.value = trimmed
      return
    }
    window.localStorage.setItem(props.storageKey, trimmed)
  })

  onMounted(() => {
    if (typeof window === "undefined") {
      return
    }
    const stored = window.localStorage.getItem(props.storageKey)
    if (stored) {
      apiKey.value = stored.trim()
      isExpanded.value = true
    }
  })
</script>

<template>
  <div
    :class="['pointer-events-auto z-30 flex items-center gap-2', props.class]"
    data-api-key-zone
  >
    <Input
      ref="inputRef"
      :id="props.storageKey"
      v-model="apiKey"
      autocomplete="off"
      placeholder="sk-..."
      :class="[
        'api-input border-0 border-b rounded-none border-neutral-300 bg-transparent text-sm text-neutral-700 outline-none focus-visible:border-neutral-900 focus-visible:ring-0 dark:border-neutral-700 dark:text-neutral-200 dark:focus-visible:border-neutral-200',
        isExpanded ? 'expanded' : 'collapsed'
      ]"
      @blur="handleBlur"
    />
    <Button
      variant="ghost"
      :aria-expanded="isExpanded"
      aria-label="Toggle OpenAI API key input"
      class="flex size-9 items-center justify-center border border-neutral-200/70 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-0 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:bg-neutral-900/70 dark:hover:text-neutral-100"
      @click="toggleField"
    >
      <Key class="size-4" />
    </Button>
    <span class="flex items-center">
      <Check v-if="apiKeyValid" class="size-4 text-emerald-500" />
      <AlertCircle v-else class="size-4 text-neutral-400" />
    </span>
  </div>
</template>

<style scoped>
  .api-input {
    width: 6rem;
    transition: width 0.25s ease;
  }
  .api-input.expanded {
    width: 13rem;
  }
  .api-input.collapsed {
    width: 0rem;
    opacity: 0;
  }
</style>
