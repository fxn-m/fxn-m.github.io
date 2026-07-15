import "./main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./client/app";
import { ThemeProvider } from "./client/components/theme/theme-provider";

const container = document.getElementById("root");

if (!container) {
  throw new Error("App root container not found");
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
