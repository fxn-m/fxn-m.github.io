<script setup lang="ts">
  import { Easing, Motion } from "motion-v"
  import { computed } from "vue"

  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
  } from "@/client/components/ui/card"

  const props = defineProps<{
    index: number
  }>()

  const transition = computed(() => ({
    duration: 0.55,
    delay: 0.12 * props.index,
    ease: [0.16, 1, 0.3, 1] as Easing
  }))

  const cardTone =
    "overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-none transition-colors"
  const cardHeaderTone =
    "flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 bg-transparent py-4"
  const cardContentTone =
    "space-y-4 bg-transparent text-neutral-700 dark:text-neutral-300 py-4"
  const cardFooterTone =
    "flex flex-col gap-1 border-t border-neutral-200 dark:border-neutral-800 bg-transparent py-3 text-[10px] uppercase tracking-[0.4em]"
</script>

<template>
  <Motion
    class="block"
    :initial="{ opacity: 0, y: 72 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="transition"
  >
    <Card :class="cardTone">
      <CardHeader :class="cardHeaderTone">
        <div class="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="h-3 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
      </CardHeader>
      <CardContent :class="[cardContentTone, 'animate-pulse']">
        <div class="space-y-2">
          <div class="h-2 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-12 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div class="grid gap-3">
          <div v-for="n in 3" :key="n" class="space-y-2">
            <div class="h-2 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div
              class="h-8 w-full rounded bg-neutral-200 dark:bg-neutral-800"
            />
          </div>
        </div>
        <div class="grid gap-2">
          <div class="h-2 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-8 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div class="space-y-2">
          <div class="h-2 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-12 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div class="space-y-2">
          <div class="h-2 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-8 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </CardContent>
      <CardFooter :class="cardFooterTone">
        <div class="h-2 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="h-2 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
      </CardFooter>
    </Card>
  </Motion>
</template>
