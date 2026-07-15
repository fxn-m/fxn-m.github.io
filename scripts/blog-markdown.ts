import * as cheerio from "cheerio";
import he from "he";
import showdown from "showdown";

const replaceVideoLinksWithIframes = (html: string): string => {
  const document = cheerio.load(html);

  document("a").each((_, element) => {
    const anchor = document(element);
    const text = anchor.text().trim();
    const href = anchor.attr("href") ?? "";
    const parent = anchor.closest("p");

    if (
      parent.length !== 1 ||
      parent.contents().length !== 1 ||
      parent.children("a").length !== 1 ||
      !text ||
      !href.includes("youtube.com/watch")
    ) {
      return;
    }

    const videoId = href.match(/v=([a-zA-Z0-9_-]{11})/)?.[1];
    if (!videoId) {
      return;
    }

    parent.replaceWith(`
      <div class='YTContainer' title="${text}">
        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>`);
  });

  return document.html();
};

export const convertMarkdownToHTML = (
  markdown: string,
): { content: string; meta: { date: string; title: string } } => {
  const converter = new showdown.Converter({ metadata: true });
  const html = converter.makeHtml(markdown);
  const metadata = converter.getMetadata();
  if (typeof metadata !== "object") {
    throw new Error("Invalid metadata format");
  }

  return {
    content: replaceVideoLinksWithIframes(html),
    meta: {
      date: he.decode(metadata.Date).replace(/^"|"$/g, ""),
      title: he.decode(metadata.Title).replace(/^"|"$/g, ""),
    },
  };
};
