<template>
  <div class="container mt-4 sm:mt-16">
    <div
      v-if="isLoading"
      class="flex flex-col justify-center items-center"
    >
      <Loader2 class="size-6 animate-spin" />
    </div>

    <div v-else>
      <div class="metadata">
        <h1 class="text-wrap text-black dark:text-white">
          {{ metadata.title }}
        </h1>
        <p>{{ metadata.date }}</p>
      </div>

      <div class="blog" v-html="blogContent"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { BlogMetadata, BlogPost } from "@/shared"
  import {
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    watchEffect
  } from "vue"
  import { useRoute } from "vue-router"
  import { convertMarkdownToHTML } from "@/server/utils/blogUtils"
  import { Loader2 } from "lucide-vue-next"

  import hljs from "highlight.js/lib/core"
  import javascript from "highlight.js/lib/languages/javascript"
  import css from "highlight.js/lib/languages/css"
  import html from "highlight.js/lib/languages/xml"
  import { useQuery } from "@tanstack/vue-query"
  hljs.registerLanguage("javascript", javascript)
  hljs.registerLanguage("css", css)
  hljs.registerLanguage("html", html)

  const currentThemeLink = ref<HTMLLinkElement | null>(null)
  const darkThemeUrl = new URL(
    "highlight.js/styles/atom-one-dark.min.css",
    import.meta.url
  ).href
  const lightThemeUrl = new URL(
    "highlight.js/styles/atom-one-light.min.css",
    import.meta.url
  ).href

  function setHighlightTheme(isDark: boolean) {
    if (
      currentThemeLink.value &&
      currentThemeLink.value.parentNode
    ) {
      currentThemeLink.value.parentNode.removeChild(
        currentThemeLink.value
      )
      currentThemeLink.value = null
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = isDark ? darkThemeUrl : lightThemeUrl
    document.head.appendChild(link)
    currentThemeLink.value = link
  }

  const route = useRoute()
  const blogContent = ref()
  const metadata = ref()
  const isLoading = ref(true)

  const slugMap =
    localStorage.getItem("slugMap") &&
    JSON.parse(localStorage.getItem("slugMap") as string)

  const isDev = import.meta.env.DEV

  const slug = route.params.slug as string

  if (isDev) {
    // ─── Development: use TanStack Query ─────────────────────────────────────────
    const fetchBlogContentAndParseMarkdown = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/blog/${
          slugMap[slug ?? ""]
        }`,
        {
          method: "GET"
        }
      )
      const markdown = await response.json()
      const { content, meta } =
        convertMarkdownToHTML(markdown)

      return {
        content,
        meta
      }
    }

    const { data } = useQuery({
      queryKey: [slug],
      queryFn: fetchBlogContentAndParseMarkdown,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: true
    })

    watchEffect(() => {
      if (!data.value) {
        return
      }
      blogContent.value = data.value.content
      metadata.value = data.value.meta
    })
  }

  onMounted(async () => {
    const slug = route.params.slug as string
    let html: string = ""
    let metaTemp = undefined as unknown as BlogMetadata

    switch (import.meta.env.MODE) {
      case "production":
        try {
          const response = await fetch(
            `/html/${slug}.html`,
            {
              method: "GET"
            }
          )
          html = await response.text()

          const index = await fetch(`/html/index.json`, {
            method: "GET"
          })
          const indexData = await index.json()

          const meta = indexData.find(
            (item: BlogPost) => item.slug === slug
          )
          metaTemp = meta
        } catch (error) {
          console.error(
            "Failed to load blog content:",
            error
          )
        }

        break
    }

    blogContent.value = html || blogContent.value
    metadata.value = metaTemp || metadata.value
    isLoading.value = false
  })

  watchEffect(async () => {
    if (blogContent.value) {
      await nextTick()
      const preElements = document.querySelectorAll("pre")
      preElements.forEach((pre) => {
        const codeElement = pre.querySelector("code")
        if (codeElement) {
          hljs.highlightElement(codeElement)
        }
      })

      // Add target="_blank" and rel="noopener noreferrer" to external links
      const anchorElements = document.querySelectorAll(
        "a[href^='http://'], a[href^='https://']"
      )
      anchorElements.forEach((anchor) => {
        anchor.setAttribute("target", "_blank")
      })

      // Extrac the alt text from images within the blog class and append it as a caption
      const imageElements =
        document.querySelectorAll(".blog img")
      imageElements.forEach((image) => {
        const altText = image.getAttribute("alt")
        if (altText && altText !== "Image") {
          const caption = document.createElement("div")
          caption.setAttribute("class", "img-caption")
          caption.textContent = altText
          image.parentNode?.insertBefore(
            caption,
            image.nextSibling
          )
        }
      })
    }
  })

  setHighlightTheme(
    document.body.classList.contains("dark")
  )

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        setHighlightTheme(
          document.body.classList.contains("dark")
        )
      }
    })
  })
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  })

  onUnmounted(() => {
    observer.disconnect()
  })
</script>

<style scoped>
  .container {
    width: 100%;
  }

  .metadata {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    align-items: baseline;
    justify-content: space-between;

    margin: 0 auto 2em auto;
  }

  .metadata h3 {
    color: #686868;
  }

  .metadata p {
    color: #b3b3b3;
    font-size: 0.95em;
    flex-grow: 1;
    text-align: right;
  }

  h1 {
    margin: 0;
    text-decoration: none;
    transition: color 0s ease-in-out;
    font-size: xx-large;
    font-weight: 600;
  }

  .blog:deep(h1) {
    margin: 1em 0 auto 0;
    flex: 0 0 auto;
    text-decoration: none;
    transition: color 0s ease-in-out;
    font-size: x-large;
    font-weight: 600;
  }

  .blog:deep(p) {
    margin: 1.5em 0;
  }

  body.dark h3 {
    color: #b3b3b3;
  }

  .blog {
    margin-top: 1em;
  }

  .blog:deep(ul li) {
    list-style-type: disc;
    margin: 0.5em 0;
  }

  .blog:deep(ul) {
    margin: 1em 0em 1em 2em;
  }

  .blog:deep(ol) {
    list-style-type: decimal;
    margin: 1em 0em 1em 2em;
  }

  .blog:deep(ol p) {
    margin: 0.5em 0;
  }

  .blog:deep(ol ol) {
    margin: 0em 0em 1em 2em;
  }

  .blog:deep(ol li li) {
    list-style-type: lower-alpha;
    margin: 1em 0;
  }

  .blog:deep(img) {
    max-width: 100%;
    margin: 2em auto;
    border-radius: 1em;
  }

  .blog:deep(em) {
    overflow-x: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
  }

  .blog:deep(div.YTContainer) {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 2em 0;
  }

  .blog:deep(div.YTContainer iframe) {
    width: 75%;
    aspect-ratio: 16 / 9;
    margin: 1em auto;
  }

  .blog:deep(div.YTContainer::after) {
    content: attr(title);
    text-align: center;
    font-size: 0.8em;
    color: #b3b3b3;
  }

  .blog:deep(code) {
    background-color: inherit;
    font-size: 0.9em;
    margin: 0;
  }

  .blog:deep(h1, h2, h3, h4, h5, h6) {
    color: black;
  }

  body.dark .blog:deep(h1, h2, h3, h4, h5, h6) {
    color: white;
  }

  .blog:deep(pre) {
    padding: 1em;
    margin: 1em 0;
  }

  .blog:deep(hr) {
    margin: 2em 0;
    color: darkgrey;
  }

  body.dark .blog:deep(hr) {
    color: #364153;
  }

  .blog:deep(div.img-caption) {
    position: relative;
    font-size: 0.8em;
    text-align: center;
    top: -1.5em;
    font-style: italic;
  }

  .blog:deep(summary):hover {
    cursor: pointer !important ;
  }
</style>
