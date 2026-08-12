import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

import type { EnrichedTabOverflowItem, TabOverflowPage } from "./module";

const nonEmptyText = z.string().trim().min(1);

export const EnrichedTabOverflowItemSchema = z.object({
  author: nonEmptyText,
  categories: z.array(nonEmptyText).min(1).max(3),
  readingTimeEstimate: z.number().int().nonnegative(),
  summary: nonEmptyText,
});

export const createTabOverflowEnricher = (apiKey: string) => {
  const google = createGoogleGenerativeAI({
    apiKey,
    fetch: (...args) => globalThis.fetch(...args),
  });

  return {
    async enrich(page: TabOverflowPage, categories: string[]): Promise<EnrichedTabOverflowItem> {
      const { output } = await generateText({
        model: google("gemini-3.1-flash-lite"),
        output: Output.object({ schema: EnrichedTabOverflowItemSchema }),
        prompt: `Summarize the article at the URL using URL context for the page content.
Title: ${page.title}
URL: ${page.url}

Return 1-3 categories from this list: ${categories.join(", ")}.
Be as specific as possible; prefer 1 category if extra categories are redundant.
The author must be exactly one person's name and must not contain commas. If multiple authors are listed, choose the primary author; if no primary author is clear, use "Unknown".
The reading time estimate should be in minutes. If unclear, use 0.`,
        tools: {
          url_context: google.tools.urlContext({}),
        },
      });

      return output;
    },
  };
};
