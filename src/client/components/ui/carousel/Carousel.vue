<script setup lang="ts">
  import { cn } from "@/client/lib/utils"

  import type {
    CarouselEmits,
    CarouselProps,
    WithClassAsProps
  } from "./interface"
  import { useProvideCarousel } from "./useCarousel"

  const props = withDefaults(defineProps<CarouselProps & WithClassAsProps>(), {
    orientation: "horizontal"
  })

  const emits = defineEmits<CarouselEmits>()

  const {
    canScrollNext,
    canScrollPrev,
    carouselApi,
    carouselRef,
    orientation,
    scrollNext,
    scrollPrev
  } = useProvideCarousel(props, emits)

  defineExpose({
    canScrollNext,
    canScrollPrev,
    carouselApi,
    carouselRef,
    orientation,
    scrollNext,
    scrollPrev
  })

  // Skip carousel shortcuts when focus is inside editable controls.
  function shouldIgnoreKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented)
      return true

    const target = event.target

    if (!(target instanceof HTMLElement))
      return false

    if (target === event.currentTarget)
      return false

    if (target.isContentEditable)
      return true

    const interactiveSelector =
      'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'

    return (
      target.matches(interactiveSelector) ||
      target.closest(interactiveSelector) !== null
    )
  }

  function onKeyDown(event: KeyboardEvent) {
    if (shouldIgnoreKeydown(event))
      return

    const prevKey = props.orientation === "vertical" ? "ArrowUp" : "ArrowLeft"
    const nextKey =
      props.orientation === "vertical" ? "ArrowDown" : "ArrowRight"

    if (event.key === prevKey) {
      event.preventDefault()
      scrollPrev()

      return
    }

    if (event.key === nextKey) {
      event.preventDefault()
      scrollNext()
    }
  }
</script>

<template>
  <div
    data-slot="carousel"
    :class="
      cn(
        'relative outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
        props.class
      )
    "
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot
      :can-scroll-next
      :can-scroll-prev
      :carousel-api
      :carousel-ref
      :orientation
      :scroll-next
      :scroll-prev
    />
  </div>
</template>
