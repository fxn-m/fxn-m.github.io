import "./main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./client/app";

const container = document.getElementById("root");

if (!container) {
  throw new Error("App root container not found");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
