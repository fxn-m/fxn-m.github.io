import he from "he";
import showdown from "showdown";
import type { ShowdownExtension } from "showdown";

const captionConverter = new showdown.Converter();

const escapeAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const renderCaption = (markdown: string): { html: string; text: string } => {
  const rendered = captionConverter.makeHtml(markdown).trim();
  const html =
    rendered.startsWith("<p>") && rendered.endsWith("</p>") ? rendered.slice(3, -4) : rendered;
  const text = he.decode(html.replace(/<[^>]*>/g, "")).trim();
  return { html, text };
};

const renderRichImageCaption = (line: string): string => {
  const indentation = line.match(/^\s{0,3}/)?.[0] ?? "";
  const imageMarkdown = line.slice(indentation.length);

  if (!imageMarkdown.startsWith("![") || !imageMarkdown.endsWith(")")) {
    return line;
  }

  const destinationStart = imageMarkdown.lastIndexOf("](");
  if (destinationStart <= 1) {
    return line;
  }

  const caption = imageMarkdown.slice(2, destinationStart);
  if (!caption.includes("](")) {
    return line;
  }

  const source = imageMarkdown.slice(destinationStart + 2, -1);
  if (!source) {
    return line;
  }

  const renderedCaption = renderCaption(caption);
  return `${indentation}<figure class="blog-image">
${indentation}<img src="${escapeAttribute(source)}" alt="${escapeAttribute(renderedCaption.text)}">
${indentation}<figcaption>${renderedCaption.html}</figcaption>
${indentation}</figure>`;
};

const renderRichImageCaptions: ShowdownExtension = {
  type: "lang",
  filter(markdown) {
    let fence: { character: string; length: number } | null = null;

    return markdown
      .split("\n")
      .map((line) => {
        const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (fenceMatch) {
          const marker = fenceMatch[1];

          if (!fence) {
            fence = { character: marker[0], length: marker.length };
          } else if (marker[0] === fence.character && marker.length >= fence.length) {
            fence = null;
          }

          return line;
        }

        return fence ? line : renderRichImageCaption(line);
      })
      .join("\n");
  },
};

export const blogImageFigures = [renderRichImageCaptions];
