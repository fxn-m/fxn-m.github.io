import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

const patchCanvasContext = () => {
  if (typeof window === "undefined") {
    return
  }

  type CanvasPrototype = HTMLCanvasElement & {
    __voltairePatchedContext?: boolean
  }

  const prototype = HTMLCanvasElement.prototype as CanvasPrototype

  if (prototype.__voltairePatchedContext) {
    return
  }

  type GetContext = HTMLCanvasElement["getContext"]
  const originalGetContext: GetContext = prototype.getContext
  const callOriginal = originalGetContext as (
    this: HTMLCanvasElement,
    contextId: string,
    options?: unknown
  ) => ReturnType<GetContext>

  const patchedGetContext = function getContextWithReadHint(
    this: HTMLCanvasElement,
    ...args: unknown[]
  ) {
    const [contextId, options] = args as [string | undefined, unknown]

    if (contextId === "2d") {
      const normalizedOptions =
        options && typeof options === "object"
          ? {
              willReadFrequently: true,
              ...(options as CanvasRenderingContext2DSettings)
            }
          : { willReadFrequently: true }

      return callOriginal.call(this, contextId, normalizedOptions)
    }

    return callOriginal.apply(this, args as [string, unknown])
  }

  prototype.getContext = patchedGetContext as GetContext

  prototype.__voltairePatchedContext = true
}

patchCanvasContext()

type MountFn = (target: HTMLElement) => () => void

const mountVoltaire: MountFn = (target) => {
  const root = ReactDOM.createRoot(target)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  return () => {
    root.unmount()
  }
}

declare global {
  interface Window {
    mountVoltaire?: MountFn
  }
}

if (import.meta.env.DEV) {
  const devRoot = document.getElementById("root")
  if (devRoot) {
    mountVoltaire(devRoot)
  }
}

if (typeof window !== "undefined") {
  window.mountVoltaire = mountVoltaire
}

export {}
