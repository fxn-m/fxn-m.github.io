import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { expect, it, vi } from "vitest";

import { BlogContent } from "./blog-content";
import { TopBar } from "./top-bar";

vi.mock("./theme/theme-toggle", () => ({ default: () => null }));

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
    '<h2 id="intro">Introduction</h2><p>Text <a id="fnref-1" href="#fn-1">1</a></p><h3>Details</h3><p>Note <a id="fn-1" href="#fnref-1">Back</a></p><img src="example.png" alt="Example">';

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
    const contents = host.querySelector('nav[aria-label="Table of contents"]')!;
    const links = contents.querySelectorAll("a");
    expect([...links].map((link) => link.textContent)).toEqual(["Introduction", "Details"]);
    expect(links[0].getAttribute("href")).toBe("#/writing/limits#intro");
    await act(async () => {
      links[1].click();
    });
    expect(scrolls.at(-1)).toBe("section-2");
    expect(document.activeElement).toBe(host.querySelector("#section-2"));
    expect(links[1].getAttribute("aria-current")).toBe("location");
    expect(host.querySelector('button[aria-label="Enlarge image: Example"]')).toBe(imageControl);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    scroll.mockRestore();
  }
});

it("keeps the nav hidden during footnote jumps and highlights the target until a click elsewhere", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.history.replaceState(null, "", "/#/writing/limits");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
  let scrollY = 0;
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => scrollY });
  const scroll = vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(function () {
    scrollY = 200;
  });

  try {
    await act(async () => {
      root.render(
        <HashRouter>
          <TopBar />
          <BlogContent
            html={
              '<p>Text<a id="fnref-1" href="#fn-1">[1]</a></p><a id="fn-1" href="#fnref-1">Back</a>'
            }
          />
        </HashRouter>,
      );
    });
    const nav = host.querySelector("[data-top-bar]")!;
    await act(async () => {
      scrollY = 1200;
      window.dispatchEvent(new Event("scroll"));
    });
    expect(nav.getAttribute("data-visible")).toBe("false");

    await act(async () => {
      window.history.pushState(null, "", "#/writing/limits#fnref-1");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await act(async () => window.dispatchEvent(new Event("scroll")));
    expect(nav.getAttribute("data-visible")).toBe("false");
    const reference = host.querySelector("#fnref-1")!;
    expect(reference.textContent).toBe("1");
    expect(reference.hasAttribute("data-footnote-active")).toBe(true);
    document.body.click();
    expect(reference.hasAttribute("data-footnote-active")).toBe(false);

    await act(async () => {
      scrollY = 140;
      window.dispatchEvent(new Event("scroll"));
    });
    expect(nav.getAttribute("data-visible")).toBe("true");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    scroll.mockRestore();
    if (originalScrollY) Object.defineProperty(window, "scrollY", originalScrollY);
  }
});

it("updates the current contents section when scrolling down and back up without changing the URL", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.history.replaceState(null, "", "/#/writing/limits");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let offset = 0;
  const positions: Record<string, number> = { intro: 100, details: 500, ending: 900 };
  const bounds = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      return { top: (positions[this.id] ?? 0) - offset } as DOMRect;
    });
  let pendingFrame: FrameRequestCallback | undefined;
  const frame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    pendingFrame = callback;
    return 1;
  });
  try {
    await act(async () => {
      root.render(
        <HashRouter>
          <BlogContent html='<h2 id="intro">Intro</h2><p>First</p><h2 id="details">Details</h2><p>Second</p><h2 id="ending">Ending</h2>' />
        </HashRouter>,
      );
    });
    const current = () => host.querySelector('nav a[aria-current="location"]')?.textContent;
    expect(current()).toBe("Intro");
    for (const [scroll, expected] of [
      [450, "Details"],
      [850, "Ending"],
      [200, "Intro"],
    ] as const) {
      await act(async () => {
        offset = scroll;
        window.dispatchEvent(new Event("scroll"));
        pendingFrame?.(0);
      });
      expect(current()).toBe(expected);
      expect(host.querySelectorAll('nav a[aria-current="location"]')).toHaveLength(1);
      expect(window.location.hash).toBe("#/writing/limits");
    }
  } finally {
    await act(async () => root.unmount());
    host.remove();
    bounds.mockRestore();
    frame.mockRestore();
  }
});
