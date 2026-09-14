import { describe, expect, it } from "vitest";

import { convertMarkdownToHTML } from "../../../scripts/blog-markdown";

describe("blog markdown", () => {
  it.each([
    "https://app.notion.com/p/workspace/Blog-page?p=post",
    "https://www.notion.so/page",
    "https://notion.so/page",
    "https://example.notion.site/page",
  ])("localizes footnotes from %s", (notionPage) => {
    const { content } = convertMarkdownToHTML(`---
Title: "Local footnotes"
Date: "2026-09-13"
---

The term[[2]](${notionPage}#fn-2) persists.

1. A useful definition. [↩︎](${notionPage}#fnref-2)
`);

    expect(content).toContain('<a href="#fn-2" id="fnref-2">[2]</a>');
    expect(content).toContain('<a href="#fnref-2" id="fn-2">↩︎</a>');
    expect(content).not.toContain("app.notion.com");
  });

  it("keeps a paragraph following an ordered list outside the final list item", () => {
    const { content } = convertMarkdownToHTML(`---
Title: "List boundary"
Date: "2026-09-13"
---

1. surfaces the implicit assumptions
2. records ADRs and key terms
This isn’t a new idea.

Without alignment, implementation drifts.
`);

    expect(content).toContain(
      "</ol>\n<p>This isn’t a new idea.</p>\n<p>Without alignment, implementation drifts.</p>",
    );
    expect(content).not.toContain("This isn’t a new idea.</li>");
  });

  it("renders pipe tables as HTML tables", () => {
    const { content } = convertMarkdownToHTML(`---
Title: "Table"
Date: "2026-09-14"
---

| Limit | Value |
| --- | --- |
| One | Two |
`);

    expect(content).toContain("<table>");
    expect(content).toContain("<th>Limit</th>");
    expect(content).toContain("<td>Two</td>");
    expect(content).not.toContain("| Limit | Value |");
  });

  it("renders rich Notion image captions without corrupting image markup", () => {
    const { content } = convertMarkdownToHTML(`---
Title: "Rich image caption"
Date: "2026-07-18"
---

![[GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra) (High) marked three assets as \`unknown\`.](https://example.com/contact-sheet.webp)
`);

    expect(content).toContain('<figure class="blog-image">');
    expect(content).toContain(
      '<img src="https://example.com/contact-sheet.webp" alt="GPT-5.6 Terra (High) marked three assets as unknown.">',
    );
    expect(content).toContain(
      '<figcaption><a href="https://developers.openai.com/api/docs/models/gpt-5.6-terra">GPT-5.6 Terra</a> (High) marked three assets as <code>unknown</code>.</figcaption>',
    );
    expect(content).not.toContain("&lt;img");
  });

  it("highlights fenced code using its source language", () => {
    const { content } = convertMarkdownToHTML(`---
Title: "Syntax highlighting"
Date: "2026-07-18"
---

\`\`\`json
{
  "assetId": "asset-005",
  "confidence": "high"
}
\`\`\`
`);

    expect(content).toContain("language-json");
    expect(content).toContain('class="hljs-attr"');
    expect(content).toContain('class="hljs-string"');
  });
});
