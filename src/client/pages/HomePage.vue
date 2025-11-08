<template>
  <div id="content">
    <p class="mt-0 mb-2">
      Founding Engineer @
      <a href="https://kenobi.ai" target="_blank">Kenobi</a>
      (YC W22).
    </p>

    <p class="my-2">Based in London.</p>

    <Motion
      :initial="{ opacity: 0 }"
      :animate="voltaireReady ? { opacity: 1 } : { opacity: 0 }"
      :transition="{ duration: 5 }"
      class="relative flex flex-1 min-h-0"
    >
      <div ref="asciiHost" class="relative flex-1 min-h-0 w-full" />
    </Motion>

    <footer
      class="relative left-0 bottom-0 z-[1] mt-auto flex w-full items-center justify-between bg-inherit pb-4 text-right"
    >
      <p class="m-0 ml-auto text-[0.8rem] text-neutral-400">
        Last updated: {{ buildDate }}
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { format } from "date-fns"
  import { Motion } from "motion-v"
  import { onBeforeUnmount, onMounted, ref } from "vue"

  type ViteManifestEntry = {
    file: string
    css?: string[]
    imports?: string[]
    dynamicImports?: string[]
  }

  type ViteManifest = Record<string, ViteManifestEntry>

  declare global {
    interface Window {
      // eslint-disable-next-line
      mountVoltaire?: (target: HTMLElement) => () => void
    }
  }

  const VOLTAIRE_BASE_PATH = "/voltaire/dist"
  const VOLTAIRE_ENTRY = "src/main.tsx"
  const VOLTAIRE_FALLBACK_SCRIPT = "/voltaire/dist/assets/index.js"
  const VOLTAIRE_FALLBACK_STYLE = "/voltaire/dist/assets/main.css"

  type VoltaireWindow = Window & { __voltairePlantLoaded?: boolean }

  const asciiHost = ref<HTMLElement | null>(null)
  const voltaireReady = ref(false)
  let dispose: (() => void) | undefined
  const appendedNodes: Array<HTMLScriptElement | HTMLLinkElement> = []
  let listeningForVoltaire = false

  const appendNode = <T extends HTMLLinkElement | HTMLScriptElement>(
    node: T
  ) => {
    appendedNodes.push(node)
    if (node.tagName === "SCRIPT") {
      document.body.appendChild(node)
    } else {
      document.head.appendChild(node)
    }
    return node
  }

  const mountFromAssets = (
    scriptSrc: string,
    cssPaths: string[],
    preloadPaths: string[]
  ) => {
    preloadPaths.forEach((href) => {
      const preloadEl = document.createElement("link")
      preloadEl.rel = "modulepreload"
      preloadEl.crossOrigin = "anonymous"
      preloadEl.href = href
      appendNode(preloadEl)
    })

    cssPaths.forEach((href) => {
      const cssEl = document.createElement("link")
      cssEl.rel = "stylesheet"
      cssEl.href = href
      appendNode(cssEl)
    })

    const scriptEl = document.createElement("script")
    scriptEl.type = "module"
    scriptEl.crossOrigin = "anonymous"
    scriptEl.src = scriptSrc
    scriptEl.onload = () => {
      if (!asciiHost.value) return
      dispose = window.mountVoltaire?.(asciiHost.value)
    }
    scriptEl.onerror = (event) => {
      console.error("[voltaire] failed to load module", event)
    }
    appendNode(scriptEl)
  }

  const mountWithFallback = () => {
    if (!asciiHost.value) return
    console.warn("[voltaire] falling back to legacy assets")
    mountFromAssets(VOLTAIRE_FALLBACK_SCRIPT, [VOLTAIRE_FALLBACK_STYLE], [])
  }

  const loadVoltaire = async () => {
    if (!asciiHost.value) return

    let manifest: ViteManifest | undefined
    try {
      const response = await fetch(`${VOLTAIRE_BASE_PATH}/manifest.json`, {
        cache: "force-cache"
      })
      if (!response.ok) {
        throw new Error(`Unable to load Voltaire manifest: ${response.status}`)
      }
      manifest = (await response.json()) as ViteManifest
    } catch (error) {
      console.error("[voltaire] failed to fetch manifest", error)
      mountWithFallback()
      return
    }

    const entry = manifest[VOLTAIRE_ENTRY]
    if (!entry) {
      console.error("[voltaire] manifest missing entry", VOLTAIRE_ENTRY)
      mountWithFallback()
      return
    }

    const scriptSrc = `${VOLTAIRE_BASE_PATH}/${entry.file}`
    const cssPaths = (entry.css ?? []).map(
      (path) => `${VOLTAIRE_BASE_PATH}/${path}`
    )
    const preloadPaths = (entry.imports ?? []).map(
      (path) => `${VOLTAIRE_BASE_PATH}/${path}`
    )

    mountFromAssets(scriptSrc, cssPaths, preloadPaths)
  }

  const handleVoltaireModelLoaded = () => {
    voltaireReady.value = true
    if (listeningForVoltaire) {
      window.removeEventListener(
        "voltaire:model-loaded",
        handleVoltaireModelLoaded
      )
      listeningForVoltaire = false
    }
  }

  onMounted(() => {
    const typedWindow = window as VoltaireWindow
    if (typedWindow.__voltairePlantLoaded) {
      voltaireReady.value = true
    } else {
      window.addEventListener(
        "voltaire:model-loaded",
        handleVoltaireModelLoaded
      )
      listeningForVoltaire = true
    }

    void loadVoltaire()
  })

  onBeforeUnmount(() => {
    if (listeningForVoltaire) {
      window.removeEventListener(
        "voltaire:model-loaded",
        handleVoltaireModelLoaded
      )
      listeningForVoltaire = false
    }

    dispose?.()
    appendedNodes.forEach((node) => {
      if (node.parentNode) {
        node.parentNode.removeChild(node)
      }
    })
    appendedNodes.length = 0
  })

  const buildDate = format(
    // eslint-disable-next-line no-undef
    new Date(__BUILD_DATE__),
    "dd-MM-yyyy"
  )
</script>
