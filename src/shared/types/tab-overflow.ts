import { z } from "zod";

const optionalText = z.object({ plain_text: z.string().optional() });

export const TabOverflowItemSchema = z.object({
  id: z.string(),
  properties: z
    .object({
      Added: z
        .object({
          date: z.object({ start: z.string().nullable().optional() }).nullable().optional(),
        })
        .optional(),
      Author: z
        .object({
          select: z.object({ name: z.string() }).nullable().optional(),
        })
        .optional(),
      Categories: z
        .object({
          multi_select: z.array(z.object({ name: z.string() })).optional(),
        })
        .optional(),
      Name: z
        .object({
          title: z.array(optionalText).optional(),
        })
        .optional(),
      "Read Time": z.object({ number: z.number().nullable().optional() }).optional(),
      Summary: z.object({ rich_text: z.array(optionalText).optional() }).optional(),
      URL: z.object({ url: z.string().nullable().optional() }).optional(),
    })
    .optional(),
});

export const TabOverflowItemsSchema = z.array(TabOverflowItemSchema);

export type TabOverflowItem = z.infer<typeof TabOverflowItemSchema>;
