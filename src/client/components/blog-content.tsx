import { useEffect, useRef } from "react";

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
    <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} ref={containerRef} />
  );
}
