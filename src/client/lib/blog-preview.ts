import showdown from "showdown";

import {
  localizeNotionFootnote,
  separateBlocksFollowingLists,
} from "../../shared/blog/markdown-blocks";
import { blogImageFigures } from "../../shared/blog/markdown-images";
import { blogSyntaxHighlighting } from "../../shared/blog/markdown-highlighting";

const replaceVideoLinksWithIframes = (html: string): string => {
  const document = new DOMParser().parseFromString(html, "text/html");

  document.querySelectorAll("a").forEach((anchor) => {
    const parent = anchor.parentElement;
    const href = anchor.getAttribute("href") ?? "";
    const footnote = localizeNotionFootnote(href);
    if (footnote) {
      anchor.href = footnote.href;
      anchor.id = footnote.id;
      return;
    }
    const videoId = href.match(/youtube\.com\/watch.*[?&]v=([a-zA-Z0-9_-]{11})/)?.[1];

    if (
      parent?.tagName !== "P" ||
      parent.childNodes.length !== 1 ||
      !anchor.textContent?.trim() ||
      !videoId
    ) {
      return;
    }

    const container = document.createElement("div");
    container.className = "YTContainer";
    container.title = anchor.textContent.trim();

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("frameborder", "0");

    container.append(iframe);
    parent.replaceWith(container);
  });

  return document.body.innerHTML;
};

export const renderBlogPreview = (markdown: string): string => {
  const converter = new showdown.Converter({
    extensions: [...blogImageFigures, ...blogSyntaxHighlighting],
    metadata: true,
    tables: true,
  });
  return replaceVideoLinksWithIframes(converter.makeHtml(separateBlocksFollowingLists(markdown)));
};
