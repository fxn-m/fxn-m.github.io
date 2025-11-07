<script setup lang="ts">
  import { reactiveOmit } from "@vueuse/core"
  import type { DialogContentEmits, DialogContentProps } from "reka-ui"
  import {
    DialogContent,
    DialogOverlay,
    DialogPortal,
    useForwardPropsEmits
  } from "reka-ui"
  import type { HTMLAttributes } from "vue"
  import { computed } from "vue"

  import { cn } from "@/client/lib/utils"

  const props = withDefaults(
    defineProps<
      DialogContentProps & {
        class?: HTMLAttributes["class"]
        side?: "top" | "bottom" | "left" | "right"
      }
    >(),
    {
      side: "right"
    }
  )

  const emits = defineEmits<DialogContentEmits>()

  const delegatedProps = reactiveOmit(props, "class", "side")
  const forwarded = useForwardPropsEmits(delegatedProps, emits)

  const sideClasses = computed(() => {
    switch (props.side) {
      case "top":
        return "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
      case "bottom":
        return "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
      case "left":
        return "inset-y-0 left-0 h-full w-80 max-w-[90vw] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
      default:
        return "inset-y-0 right-0 h-full w-80 max-w-[90vw] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
    }
  })
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
    />
    <DialogContent
      data-slot="sheet-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(
        'fixed z-50 grid gap-6 overflow-y-auto border bg-background/95 p-6 text-foreground shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-200 ease-out focus:outline-none dark:border-gray-800 dark:bg-zinc-950/95 rounded-none font-sans',
        sideClasses.value,
        props.class,
      )"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
