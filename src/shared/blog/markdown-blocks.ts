const listItemPattern = /^\s*(?:\d+[.)]|[-+*])\s+/;

export const separateBlocksFollowingLists = (markdown: string): string => {
  const lines = markdown.split("\n");
  const separated: string[] = [];

  for (const line of lines) {
    const previousLine = separated.at(-1);
    const startsUnindentedBlock = /^\S/.test(line) && !listItemPattern.test(line);

    if (previousLine && listItemPattern.test(previousLine) && startsUnindentedBlock) {
      separated.push("");
    }
    separated.push(line);
  }

  return separated.join("\n");
};

type FootnoteAnchor = {
  href: string;
  id: string;
};

export const localizeNotionFootnote = (href: string): FootnoteAnchor | undefined => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }

  if (
    url.hostname !== "app.notion.com" &&
    url.hostname !== "notion.so" &&
    !url.hostname.endsWith(".notion.so") &&
    url.hostname !== "notion.site" &&
    !url.hostname.endsWith(".notion.site")
  ) {
    return undefined;
  }

  const reference = url.hash.match(/^#fn-(\d+)$/)?.[1];
  if (reference) {
    return { href: `#fn-${reference}`, id: `fnref-${reference}` };
  }

  const backlink = url.hash.match(/^#fnref-(\d+)$/)?.[1];
  if (backlink) {
    return { href: `#fnref-${backlink}`, id: `fn-${backlink}` };
  }

  return undefined;
};
