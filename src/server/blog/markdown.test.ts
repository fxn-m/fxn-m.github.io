import { describe, expect, it } from "vitest";

import { convertMarkdownToHTML } from "../../../scripts/blog-markdown";

describe("blog markdown", () => {
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
