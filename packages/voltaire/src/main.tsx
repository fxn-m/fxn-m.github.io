import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

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
