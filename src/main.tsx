import "./main.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "./client/components/theme/theme-provider";
import { queryClient } from "./client/config/query";
import { AppRouter } from "./client/router";

const container = document.getElementById("root");

if (!container) {
  throw new Error("App root container not found");
}

function Root() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(container).render(<Root />);
