import { z } from "zod"

export const readingListQueueMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("enrich-all")
  }),
  z.object({
    type: z.literal("enrich-item"),
    pageId: z.string(),
    databaseId: z.string()
  })
])

export type ReadingListQueueMessage = z.infer<
  typeof readingListQueueMessageSchema
>

export const serializeReadingListQueueMessage = (
  message: ReadingListQueueMessage
) => message

export const parseReadingListQueueMessage = (
  raw: unknown
): ReadingListQueueMessage => readingListQueueMessageSchema.parse(raw)
