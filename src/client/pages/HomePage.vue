<template>
  <div id="content">
    <p style="margin-top: 0">
      Founding Engineer @
      <a href="https://kenobi.ai" target="_blank">Kenobi</a>
      (YC W22).
    </p>

    <p>Based in London.</p>

    <Motion
      :initial="{ opacity: 0 }"
      :animate="voltaireReady ? { opacity: 1 } : { opacity: 0 }"
      :transition="{ duration: 5 }"
      class="voltaire-container"
    >
      <div ref="asciiHost" class="voltaire-host" />
    </Motion>

    <footer>
      <p>Last updated: {{ buildDate }}</p>
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

<style scoped>
  span.date {
    font-weight: bold;
  }

  li {
    margin-top: 1rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  p {
    margin: 0.4em 0;
  }

  #experience {
    font-weight: bold;
    margin-top: 2rem;
    width: 100%;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 2px;
    transition: all 0.5s ease-in-out;
  }

  body.dark #experience {
    border-bottom: 1px solid #4f4f4f;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: inherit;
    z-index: 1;
    text-align: right;
    position: relative;
    left: 0;
    bottom: 0;
    width: 100%;
    margin-top: auto;
    padding: 0 0 1rem 0;
  }

  footer p {
    color: #b3b3b3;
    font-size: 0.8rem;
    margin-left: auto;
  }

  .voltaire-container {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
  }

  .voltaire-host {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
  }

  .asterisk {
    display: inline-block;
    position: relative;
    text-align: center;
    right: 20px;
    width: 100px;
    transform: translateX(-25px);
    cursor: pointer;
    color: #d97757;
    font-size: larger;
  }

  .asterisk .popover {
    font-size: 14px;
    text-wrap: wrap;
    min-width: 500px;
    max-width: 800px;
    position: absolute;
    text-align: left;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f9f9f9;
    color: #333;
    border: 1px solid #ccc;
    padding: 5px 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  body.dark .asterisk .popover,
  body.dark .asterisk .popover a {
    color: #333;
    background-color: #bbbbbb;
    border-color: #4f4f4f;
  }

  .popover .popover-close {
    display: none;
    color: #555555;
  }

  .popover .inner-asterisk {
    display: none;
  }

  @media (max-width: 800px) {
    .asterisk .popover {
      position: fixed;
      bottom: 2%;
      left: 5vw;
      max-width: none;
      min-width: 10px;
      width: calc(90vw - 40px);
      padding: 20px;
      transform: none;
      border-radius: 0;
      white-space: normal;
      z-index: 1000;
      border-radius: 15px;
    }

    .popover .popover-close {
      display: block;
      position: absolute;
      top: 5px;
      right: 9px;
      cursor: pointer;
    }

    .popover .inner-asterisk {
      display: block;
      position: absolute;
      top: 15px;
      left: 8px;
      font-size: 1.5em !important;
    }
  }
</style>
