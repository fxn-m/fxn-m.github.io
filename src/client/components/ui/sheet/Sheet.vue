<script setup lang="ts">
  import type { DialogRootEmits, DialogRootProps } from "reka-ui"
  import { DialogRoot, useForwardPropsEmits } from "reka-ui"

  const props = withDefaults(defineProps<DialogRootProps>(), {
    modal: true
  })

  const emits = defineEmits<DialogRootEmits>()

  const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
