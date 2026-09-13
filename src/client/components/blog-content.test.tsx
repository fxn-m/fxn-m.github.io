import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { expect, it, vi } from "vitest";

import { BlogContent } from "./blog-content";

it("preserves footnote links and image controls across forward and return navigation", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.history.replaceState(null, "", "/#/writing/limits");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const scrolls: string[] = [];
  const scroll = vi
    .spyOn(HTMLElement.prototype, "scrollIntoView")
    .mockImplementation(function (this: HTMLElement) {
      scrolls.push(this.id);
    });
  const html =
    '<p>Text <a id="fnref-1" href="#fn-1">1</a></p><p>Note <a id="fn-1" href="#fnref-1">Back</a></p><img src="example.png" alt="Example">';

  try {
    await act(async () => {
      root.render(
        <StrictMode>
          <HashRouter>
            <BlogContent html={html} />
          </HashRouter>
        </StrictMode>,
      );
    });
    const reference = host.querySelector("#fnref-1");
    const imageControl = host.querySelector('button[aria-label="Enlarge image: Example"]');
    expect(imageControl).not.toBeNull();

    for (const id of ["fnref-1", "fn-1", "fnref-1"]) {
      const href = host.querySelector(`#${id}`)!.getAttribute("href")!;
      expect(href).toMatch(/^#\/writing\/limits#fn(?:ref)?-1$/);
      await act(async () => {
        // Simulate the browser following the real anchor href and notifying HashRouter.
        window.history.pushState(null, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      expect(host.querySelector("#fnref-1")).toBe(reference);
      expect(host.querySelector('button[aria-label="Enlarge image: Example"]')).toBe(imageControl);
      expect(host.querySelector("#fn-1")!.getAttribute("href")).toBe("#/writing/limits#fnref-1");
    }
    expect(scrolls).toEqual(["fn-1", "fnref-1", "fn-1"]);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    scroll.mockRestore();
  }
});
