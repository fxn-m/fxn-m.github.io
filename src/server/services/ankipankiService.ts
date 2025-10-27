import { z } from "zod"

import type { GenerateAnkiDeckRequest } from "@/shared/types/anki"
import { TopicNames } from "@/shared/types/anki"

const topicNameSchema = z.enum(TopicNames)

const subtopicSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  })
  .refine(
    (value) => !value || value.length <= 280,
    "Subtopic must be 280 characters or fewer"
  )

const generateDeckRequestSchema = z.object({
  topicName: topicNameSchema,
  subtopic: subtopicSchema,
  cardCount: z.number().int().min(1).max(10)
})

type GenerateDeckSchema = z.infer<typeof generateDeckRequestSchema>

export type GenerateDeckValidationResult =
  | { success: true; payload: GenerateDeckSchema }
  | { success: false; issues: string[] }

export const validateGenerateDeckRequest = (
  input: unknown
): GenerateDeckValidationResult => {
  const result = generateDeckRequestSchema.safeParse(input)

  if (!result.success) {
    const issues = result.error.issues.map((issue) => issue.message)
    return {
      success: false,
      issues
    }
  }

  return {
    success: true,
    payload: result.data
  }
}

export const normalizeGenerateDeckRequest = (
  input: unknown
): { success: true; payload: GenerateAnkiDeckRequest } | {
  success: false
  issues: string[]
} => {
  const validation = validateGenerateDeckRequest(input)

  if (!validation.success) {
    return validation
  }

  const payload: GenerateAnkiDeckRequest = {
    topicName: validation.payload.topicName,
    subtopic: validation.payload.subtopic,
    cardCount: validation.payload.cardCount
  }

  return {
    success: true,
    payload
  }
}
