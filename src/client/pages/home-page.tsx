import { format } from "date-fns"
import { useEffect, useRef, useState } from "react"

type ViteManifestEntry = {
  css?: string[]
  dynamicImports?: string[]
  file: string
  imports?: string[]
}

type ViteManifest = Record<string, ViteManifestEntry>

type VoltaireWindow = Window & {
  __voltairePlantLoaded?: boolean
  mountVoltaire?: (..._args: [HTMLElement]) => () => void
}

const VOLTAIRE_BASE_PATH = "/voltaire/dist"
const VOLTAIRE_ENTRY = "src/main.tsx"
const VOLTAIRE_FALLBACK_SCRIPT = "/voltaire/dist/assets/index.js"
const VOLTAIRE_FALLBACK_STYLE = "/voltaire/dist/assets/main.css"

export default function HomePage() {
  const asciiHostRef = useRef<HTMLDivElement | null>(null)
  const appendedNodesRef = useRef<Array<HTMLScriptElement | HTMLLinkElement>>([])
  const disposeRef = useRef<(() => void) | undefined>(undefined)
  const [voltaireReady, setVoltaireReady] = useState(false)

  useEffect(() => {
    const appendNode = (node: HTMLLinkElement | HTMLScriptElement) => {
      appendedNodesRef.current.push(node)
      if (node.tagName === "SCRIPT") {
        document.body.appendChild(node)
      } else {
        document.head.appendChild(node)
      }

    }

    const mountFromAssets = (
      scriptSrc: string,
      cssPaths: string[],
      preloadPaths: string[]
    ) => {
      preloadPaths.forEach((href) => {
        const preloadElement = document.createElement("link")
        preloadElement.rel = "modulepreload"
        preloadElement.crossOrigin = "anonymous"
        preloadElement.href = href
        appendNode(preloadElement)
      })

      cssPaths.forEach((href) => {
        const cssElement = document.createElement("link")
        cssElement.rel = "stylesheet"
        cssElement.href = href
        appendNode(cssElement)
      })

      const scriptElement = document.createElement("script")
      scriptElement.type = "module"
      scriptElement.crossOrigin = "anonymous"
      scriptElement.src = scriptSrc
      scriptElement.onload = () => {
        if (!asciiHostRef.current) {
          return
        }

        disposeRef.current = (window as VoltaireWindow).mountVoltaire?.(asciiHostRef.current)
      }
      scriptElement.onerror = (event) => {
        console.error("[voltaire] failed to load module", event)
      }
      appendNode(scriptElement)
    }

    const mountWithFallback = () => {
      if (!asciiHostRef.current) {
        return
      }

      console.warn("[voltaire] falling back to legacy assets")
      mountFromAssets(VOLTAIRE_FALLBACK_SCRIPT, [VOLTAIRE_FALLBACK_STYLE], [])
    }

    const loadVoltaire = async () => {
      if (!asciiHostRef.current) {
        return
      }

      try {
        const response = await fetch(`${VOLTAIRE_BASE_PATH}/manifest.json`, {
          cache: "force-cache"
        })

        if (!response.ok) {
          throw new Error(`Unable to load Voltaire manifest: ${response.status}`)
        }

        const manifest = (await response.json()) as ViteManifest
        const entry = manifest[VOLTAIRE_ENTRY]

        if (!entry) {
          throw new Error(`Manifest missing entry: ${VOLTAIRE_ENTRY}`)
        }

        mountFromAssets(
          `${VOLTAIRE_BASE_PATH}/${entry.file}`,
          (entry.css ?? []).map((path) => `${VOLTAIRE_BASE_PATH}/${path}`),
          (entry.imports ?? []).map((path) => `${VOLTAIRE_BASE_PATH}/${path}`)
        )
      } catch (error) {
        console.error("[voltaire] failed to fetch manifest", error)
        mountWithFallback()
      }
    }

    const typedWindow = window as VoltaireWindow
    const handleVoltaireModelLoaded = () => {
      setVoltaireReady(true)
      window.removeEventListener("voltaire:model-loaded", handleVoltaireModelLoaded)
    }

    if (typedWindow.__voltairePlantLoaded) {
      setVoltaireReady(true)
    } else {
      window.addEventListener("voltaire:model-loaded", handleVoltaireModelLoaded)
    }

    void loadVoltaire()

    return () => {
      window.removeEventListener("voltaire:model-loaded", handleVoltaireModelLoaded)
      disposeRef.current?.()
      appendedNodesRef.current.forEach((node) => {
        node.parentNode?.removeChild(node)
      })
      appendedNodesRef.current = []
    }
  }, [])

  const buildDate = format(new Date(__BUILD_DATE__), "dd-MM-yyyy")

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <div className="relative z-[1]">
        <p className="mb-4 mt-0">
          Founding Engineer @ <a href="https://kenobi.ai" target="_blank">Kenobi</a> (YC W22).
        </p>
        <p>Based in London.</p>
      </div>

      <div
        className={`voltaire-layer relative flex min-h-0 flex-1 transition-opacity duration-[5000ms] ${
          voltaireReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="voltaire-host absolute" ref={asciiHostRef} />
      </div>

      <footer className="relative bottom-0 left-0 z-[1] mt-auto flex w-full items-center justify-between bg-inherit pb-4 text-right">
        <p className="m-0 ml-auto text-[0.8rem] text-neutral-400">Last updated: {buildDate}</p>
      </footer>
    </div>
  )
}
