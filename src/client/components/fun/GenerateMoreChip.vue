<script setup lang="ts">
  import { Loader2, RefreshCcw } from "lucide-vue-next"
  import { computed } from "vue"

  import Button from "../ui/button/Button.vue"

  const props = withDefaults(
    defineProps<{
      label?: string
      description?: string | null
      disabled?: boolean
      loading?: boolean
    }>(),
    {
      label: "Generate More",
      description: null,
      disabled: false,
      loading: false
    }
  )

  const emit = defineEmits<{
    (event: "click"): void
  }>()

  const isDisabled = computed(() => props.disabled || props.loading)

  const handleClick = (event: MouseEvent) => {
    if (isDisabled.value) {
      event.preventDefault()
      return
    }

    emit("click")
  }
</script>

<template>
  <Button :disabled="isDisabled" variant="ghost" @click="handleClick">
    <span
      class="flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors duration-150 group-hover:bg-neutral-200 group-hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:group-hover:bg-neutral-800"
    >
      <RefreshCcw v-if="!loading" class="size-4" />
      <Loader2 v-else class="size-4" />
    </span>

    <span class="flex flex-col text-left">
      <span class="tracking-tight">{{ label }}</span>
      <span
        v-if="description"
        class="text-[11px] font-normal text-neutral-500 transition-colors duration-150 group-hover:text-neutral-600 dark:text-neutral-400 dark:group-hover:text-neutral-300"
      >
        {{ description }}
      </span>
    </span>
  </Button>
</template>
