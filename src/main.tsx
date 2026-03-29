import "./main.css"

import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"

import { usePostHog } from "@/client/analytics/posthog"
import { ThemeProvider } from "@/client/components/theme/theme-provider"
import { queryClient } from "@/client/config/query"
import router from "@/client/router"

function Root() {
  usePostHog()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

const container = document.getElementById("app")

if (!container) {
  throw new Error("App root container not found")
}

createRoot(container).render(<Root />)
