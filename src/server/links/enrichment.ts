import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

import type { EnrichedLink, LinkPage } from "./module";

const nonEmptyText = z.string().trim().min(1);

export const EnrichedLinkSchema = z.object({
  categories: z.array(nonEmptyText).min(1).max(3),
  summary: nonEmptyText,
});

export const createLinkEnricher = (apiKey: string) => {
  const google = createGoogleGenerativeAI({
    apiKey,
    fetch: (...args) => globalThis.fetch(...args),
  });

  return {
    async enrich(page: LinkPage, categories: string[]): Promise<EnrichedLink> {
      const { output } = await generateText({
        model: google("gemini-3-flash-preview"),
        output: Output.object({ schema: EnrichedLinkSchema }),
        prompt: `Summarize the link in 1-2 short sentences (ideally 1, less than 20 words) and choose 1-3 categories. Use URL context for the page content.
Title: ${page.title}
URL: ${page.url}
Existing categories: ${categories.join(", ")}
If none are a great fit, create a short new category (1-2 words, title case).`,
        tools: {
          url_context: google.tools.urlContext({}),
        },
      });

      return output;
    },
  };
};
