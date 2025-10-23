<script setup lang="ts">
  import { Loader2, RefreshCcw } from "lucide-vue-next"
  import { computed } from "vue"

  import Button from "../ui/button/Button.vue"
  import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

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
  <Tooltip>
    <TooltipTrigger as-child>
      <Button :disabled="isDisabled" variant="outline" @click="handleClick">
        <RefreshCcw v-if="!loading" class="size-4" />
        <Loader2 v-else class="size-4 animate-spin" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Create more</p>
    </TooltipContent>
  </Tooltip>
</template>
