import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import styles from "./blog-content.module.css";

type BlogContentProps = {
  html: string;
};

let nextImagePopoverId = 0;

const isGif = (image: HTMLImageElement): boolean => {
  const source = image.currentSrc || image.getAttribute("src");

  if (!source) {
    return false;
  }

  try {
    return new URL(source, window.location.href).pathname.toLowerCase().endsWith(".gif");
  } catch {
    return false;
  }
};

const addGifPlayer = (image: HTMLImageElement): (() => void) => {
  const media = image.parentElement?.tagName === "A" ? image.parentElement : image;
  const player = document.createElement("span");
  const frozenFrame = document.createElement("canvas");
  const toggle = document.createElement("button");
  const icon = document.createElement("span");
  const label = document.createElement("span");
  const originalVisibility = image.style.visibility;
  let paused = false;
  let pauseWhenLoaded = false;

  player.className = styles.gifPlayer;
  player.dataset.state = "playing";

  frozenFrame.className = styles.gifFrame;
  frozenFrame.hidden = true;
  if (image.alt) {
    frozenFrame.setAttribute("aria-label", image.alt);
    frozenFrame.setAttribute("role", "img");
  } else {
    frozenFrame.setAttribute("aria-hidden", "true");
  }

  toggle.className = styles.gifToggle;
  toggle.type = "button";

  icon.className = styles.gifIcon;
  icon.setAttribute("aria-hidden", "true");

  label.textContent = "Playing";
  toggle.append(icon, label);

  const setPaused = (nextPaused: boolean) => {
    paused = nextPaused;
    player.dataset.state = paused ? "paused" : "playing";
    image.style.visibility = paused ? "hidden" : originalVisibility;
    frozenFrame.hidden = !paused;
    label.textContent = paused ? "Paused" : "Playing";
    toggle.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
    toggle.title = paused ? "Play animation" : "Pause animation";
  };

  const pause = () => {
    if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
      pauseWhenLoaded = true;
      return;
    }

    frozenFrame.width = image.naturalWidth;
    frozenFrame.height = image.naturalHeight;

    const context = frozenFrame.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(image, 0, 0, frozenFrame.width, frozenFrame.height);
    setPaused(true);
  };

  const handleLoad = () => {
    if (pauseWhenLoaded) {
      pauseWhenLoaded = false;
      pause();
    }
  };

  const handleToggle = (event: MouseEvent) => {
    event.preventDefault();

    if (paused) {
      setPaused(false);
      return;
    }

    pause();
  };

  player.addEventListener("click", handleToggle);
  image.addEventListener("load", handleLoad);
  setPaused(false);

  media.before(player);
  player.append(media, frozenFrame, toggle);

  return () => {
    player.removeEventListener("click", handleToggle);
    image.removeEventListener("load", handleLoad);
    image.style.visibility = originalVisibility;
    player.replaceWith(media);
  };
};

const addImagePopover = (image: HTMLImageElement): (() => void) => {
  const figureCaption =
    image.parentElement?.tagName === "FIGURE"
      ? ([...image.parentElement.children].find((element) => element.tagName === "FIGCAPTION") as
          | HTMLElement
          | undefined)
      : undefined;
  const caption = figureCaption?.textContent?.trim() || image.alt.trim();
  const hasCaption = caption.toLowerCase() !== "image" && caption.length > 0;
  const popoverId = `blog-image-${nextImagePopoverId++}`;
  const trigger = document.createElement("button");
  const popover = document.createElement("span");
  const enlargedImage = image.cloneNode(true) as HTMLImageElement;
  const close = document.createElement("button");

  trigger.className = styles.imageZoomTrigger;
  trigger.type = "button";
  trigger.setAttribute("aria-label", hasCaption ? `Enlarge image: ${caption}` : "Enlarge image");
  trigger.setAttribute("popovertarget", popoverId);

  popover.className = styles.imagePopover;
  popover.id = popoverId;
  popover.setAttribute("popover", "auto");

  enlargedImage.className = styles.imagePopoverImage;
  enlargedImage.removeAttribute("loading");

  close.className = styles.imagePopoverClose;
  close.type = "button";
  close.textContent = "×";
  close.setAttribute("aria-label", "Close enlarged image");
  close.setAttribute("popovertarget", popoverId);
  close.setAttribute("popovertargetaction", "hide");

  image.before(trigger);
  trigger.append(image);

  if (hasCaption && !figureCaption) {
    const inlineCaption = document.createElement("span");
    inlineCaption.className = styles.imageCaption;
    inlineCaption.textContent = caption;
    trigger.append(inlineCaption);
  }

  popover.append(enlargedImage);

  if (hasCaption) {
    const captionElement = document.createElement("span");
    captionElement.className = styles.imagePopoverCaption;

    if (figureCaption) {
      captionElement.append(...[...figureCaption.childNodes].map((node) => node.cloneNode(true)));
    } else {
      captionElement.textContent = caption;
    }

    popover.append(captionElement);
  }

  popover.append(close);
  trigger.after(popover);

  return () => {
    popover.remove();
    trigger.replaceWith(image);
  };
};

export function BlogContent({ html }: BlogContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHeading, setActiveHeading] = useState<string>();
  // Preserve enhanced article DOM when navigation only changes the fragment.
  const { innerHTML, headings } = useMemo(() => {
    const document = new DOMParser().parseFromString(html, "text/html");
    document.querySelectorAll('a[id^="fnref-"]').forEach((reference) => {
      const number = reference.textContent?.trim().match(/^\[(\d+)\]$/)?.[1];
      if (number) reference.textContent = number;
    });
    const usedIds = new Set([...document.querySelectorAll("[id]")].map((element) => element.id));
    const headings = [...document.body.querySelectorAll<HTMLElement>("h1, h2, h3")]
      .filter((heading) => heading.textContent?.trim())
      .map((heading, index) => {
        if (!heading.id) {
          const base = `section-${index + 1}`;
          let id = base;
          let suffix = 2;
          while (usedIds.has(id)) id = `${base}-${suffix++}`;
          heading.id = id;
          usedIds.add(id);
        }
        heading.tabIndex = -1;
        return {
          id: heading.id,
          title: heading.textContent!.trim(),
          level: Number(heading.tagName.slice(1)),
        };
      });
    return { innerHTML: { __html: document.body.innerHTML }, headings };
  }, [html]);
  const { pathname, search, hash } = useLocation();
  const firstLevel = Math.min(...headings.map((heading) => heading.level));

  useEffect(() => {
    const container = containerRef.current;
    if (!container || headings.length < 2) return;
    const elements = [...container.querySelectorAll<HTMLElement>("h1, h2, h3")].filter((element) =>
      headings.some((heading) => heading.id === element.id),
    );
    let frame = 0;
    const updateActiveHeading = () => {
      frame = 0;
      // Match the sidebar's top clearance, keeping the current section active
      // until the next heading reaches the reading position.
      let active: string | undefined = elements[0]?.id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top > 96) break;
        active = element.id;
      }
      const page = document.documentElement;
      if (
        page.scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= page.scrollHeight - 2
      ) {
        active = elements.at(-1)?.id;
      }
      setActiveHeading(active);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
    };
    updateActiveHeading();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(container);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
    };
  }, [headings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Keep document anchors inside the current HashRouter route.
    const anchors = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].map(
      (anchor) => ({ anchor, fragment: anchor.getAttribute("href")! }),
    );
    anchors.forEach(({ anchor, fragment }) => {
      anchor.setAttribute("href", `#${pathname}${search}${fragment}`);
    });
    return () => {
      anchors.forEach(({ anchor, fragment }) => anchor.setAttribute("href", fragment));
    };
  }, [html, pathname, search]);

  useEffect(() => {
    if (!hash) return;
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const target = [...(containerRef.current?.querySelectorAll<HTMLElement>("[id]") ?? [])].find(
      (element) => element.id === id,
    );
    const isFootnote = /^fn(?:ref)?-\d+$/.test(id);
    target?.scrollIntoView({ behavior: "instant" });
    target?.focus({ preventScroll: true });
    if (target && headings.some((heading) => heading.id === id)) setActiveHeading(id);
    if (!target || !isFootnote) return;

    window.dispatchEvent(new Event("blog-footnote-navigation"));
    target.dataset.footnoteActive = "";
    const clearHighlight = (event: MouseEvent) => {
      if (event.target instanceof Node && target.contains(event.target)) return;
      delete target.dataset.footnoteActive;
    };
    document.addEventListener("click", clearHighlight, true);
    return () => {
      delete target.dataset.footnoteActive;
      document.removeEventListener("click", clearHighlight, true);
    };
  }, [html, hash, headings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const images = [...container.querySelectorAll("img")];
    const cleanups = [
      ...images.filter(isGif).map(addGifPlayer),
      ...images
        .filter((image) => !isGif(image) && image.parentElement?.tagName !== "A")
        .map(addImagePopover),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [html]);

  return (
    <>
      {headings.length > 1 && (
        <div className="min-[90rem]:absolute min-[90rem]:inset-y-0 min-[90rem]:right-[calc(100%+3rem)] min-[90rem]:w-48">
          <nav
            aria-label="Table of contents"
            className="mb-9 border-l border-surface pl-4 text-sm leading-snug min-[90rem]:sticky min-[90rem]:top-20 min-[90rem]:max-h-[calc(100dvh-6rem)] min-[90rem]:overflow-y-auto"
          >
            <p className="mb-3 text-xs font-medium text-muted">On this page</p>
            <ol className="m-0 list-none space-y-2 p-0">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - firstLevel) * 0.75}rem` }}
                >
                  <Link
                    aria-current={activeHeading === heading.id ? "location" : undefined}
                    className="text-muted underline-offset-[0.15em] hover:text-foreground hover:underline focus-visible:text-foreground aria-[current=location]:font-normal aria-[current=location]:text-black dark:aria-[current=location]:text-white"
                    to={`${pathname}${search}#${encodeURIComponent(heading.id)}`}
                  >
                    {heading.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}
      <div className={styles.content} dangerouslySetInnerHTML={innerHTML} ref={containerRef} />
    </>
  );
}
