<script setup lang="ts">
  import type { HTMLAttributes } from "vue"

  import { cn } from "@/client/lib/utils"

  const props = defineProps<{
    class?: HTMLAttributes["class"]
  }>()
</script>

<template>
  <td
    data-slot="table-cell"
    :class="
      cn(
        'p-px align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.class
      )
    "
  >
    <slot />
  </td>
</template>
