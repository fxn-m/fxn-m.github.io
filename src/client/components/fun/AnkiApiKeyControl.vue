<script setup lang="ts">
  import { Key } from "lucide-vue-next"
  import { computed, nextTick, onMounted, ref, watch } from "vue"

  import { Input } from "@/client/components/ui/input"

  const props = defineProps<{
    storageKey: string
    class?: string
  }>()

  const apiKey = ref("")
  const showField = ref(false)

  const inputClasses =
    "border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus-visible:border-neutral-400 dark:focus-visible:border-neutral-600 focus-visible:ring-0 transition-all duration-200"

  const maskedApiKey = computed(() => {
    const clean = apiKey.value.trim()
    if (!clean.length) {
      return "—"
    }
    if (clean.length <= 6) {
      return clean
    }
    const head = clean.slice(0, 3)
    const tail = clean.slice(-2)
    return `${head}••••${tail}`
  })

  const toggleField = async () => {
    showField.value = !showField.value
    if (showField.value) {
      await nextTick()
      const input = document.getElementById(
        props.storageKey
      ) as HTMLInputElement | null
      if (input) {
        input.focus()
        input.select()
      }
    }
  }

  const handleBlur = (event: FocusEvent) => {
    const related = event.relatedTarget as HTMLElement | null
    if (related && related.closest("[data-api-key-zone]")) {
      return
    }
    showField.value = false
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
    }
  })
</script>

<template>
  <div
    :class="['pointer-events-auto z-30 flex items-center gap-2', props.class]"
    data-api-key-zone
  >
    <button
      type="button"
      :aria-expanded="showField"
      aria-label="Set OpenAI API key"
      class="flex size-9 items-center justify-center rounded-full border border-neutral-200/80 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-900/70 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-600"
      @click="toggleField"
    >
      <Key class="size-4" />
    </button>
    <transition name="fade">
      <Input
        v-if="showField"
        :id="props.storageKey"
        v-model="apiKey"
        autocomplete="off"
        placeholder="sk-..."
        type="password"
        :class="[inputClasses, 'w-52']"
        @blur="handleBlur"
      />
    </transition>
    <span
      v-if="apiKey && !showField"
      class="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-500"
    >
      {{ maskedApiKey }}
    </span>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
