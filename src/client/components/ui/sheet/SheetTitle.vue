<script setup lang="ts">
  import type { DialogTitleProps } from "reka-ui"
  import { DialogTitle } from "reka-ui"
  import type { HTMLAttributes } from "vue"

  import { cn } from "@/client/lib/utils"

  const props = withDefaults(
    defineProps<DialogTitleProps & { class?: HTMLAttributes["class"] }>(),
    {}
  )
</script>

<template>
  <DialogTitle
    data-slot="sheet-title"
    v-bind="{ ...props, ...$attrs }"
    :class="cn('text-lg font-semibold uppercase tracking-[0.35em] text-foreground', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
