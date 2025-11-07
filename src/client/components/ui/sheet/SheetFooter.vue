<script setup lang="ts">
  import type { HTMLAttributes } from "vue"

  import { cn } from "@/client/lib/utils"

  const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <div
    data-slot="sheet-footer"
    :class="cn('mt-6 flex flex-col gap-2', props.class)"
  >
    <slot />
  </div>
</template>
