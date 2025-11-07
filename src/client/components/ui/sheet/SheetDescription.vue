<script setup lang="ts">
  import type { DialogDescriptionProps } from "reka-ui"
  import { DialogDescription } from "reka-ui"
  import type { HTMLAttributes } from "vue"

  import { cn } from "@/client/lib/utils"

  const props = withDefaults(
    defineProps<DialogDescriptionProps & { class?: HTMLAttributes["class"] }>(),
    {}
  )
</script>

<template>
  <DialogDescription
    data-slot="sheet-description"
    v-bind="{ ...props, ...$attrs }"
    :class="cn('text-xs uppercase tracking-[0.3em] text-muted-foreground/80', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
