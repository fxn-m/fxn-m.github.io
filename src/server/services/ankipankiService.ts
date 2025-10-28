import { createOpenAI } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

import type {
  AnkiCardFormat,
  GenerateAnkiDeckRequest
} from "@/shared/types/anki"
import {
  AnkiCardFormats,
  AnkiCardSchema,
  ClozeDefinitionCard,
  EnumeratedListCard,
  QADefinitionCard,
  TopicNames
} from "@/shared/types/anki"

import type { AppConfig } from "../config/appConfig"

const boundFetch: typeof fetch = (...args) => globalThis.fetch(...args)

const createOpenAIProvider = (config: AppConfig) =>
  createOpenAI({
    apiKey: config.openaiApiKey,
    fetch: boundFetch
  })

const generationFormatSchemas: Record<AnkiCardFormat, z.ZodTypeAny> = {
  cloze_definition: ClozeDefinitionCard.omit({ id: true, createdAt: true }),
  enumerated_list: EnumeratedListCard.omit({ id: true, createdAt: true }),
  qa_definition: QADefinitionCard.omit({ id: true, createdAt: true })
}

const formatInstructions: Record<AnkiCardFormat, string> = {
  cloze_definition:
    "Produce rich text suitable for Anki cloze deletion cards. Wrap hidden terms inside <span class='cloze'>...</span> or {{c1::...}} syntax, avoid markdown lists, and include enough context for recall.",
  enumerated_list:
    "Produce an ordered list of distinct items that answer the prompt. The 'prompt' field should clearly state what the list covers, and 'items' must contain exactly the enumerated entries in order of importance.",
  qa_definition:
    "Create a single clear question and its direct answer. Emphasize precise FRM terminology and concise explanations that work standalone."
}

const buildGenerationResponseSchema = (
  cardFormat: AnkiCardFormat,
  cardCount: number
) =>
  z.object({
    cards: z
      .array(generationFormatSchemas[cardFormat])
      .length(
        cardCount,
        `Expected exactly ${cardCount} ${cardCount === 1 ? "card" : "cards"}`
      )
  })

const buildGenerationPrompt = (request: GenerateAnkiDeckRequest): string => {
  const { topicName, subtopic, cardFormat, cardCount } = request
  const scope = subtopic
    ? `Topic: ${topicName}\nSubtopic: ${subtopic}`
    : `Topic: ${topicName}`

  return `You are generating flashcards for FRM exam preparation.\n${scope}\nDesired card format: ${cardFormat}.\n${formatInstructions[cardFormat]}\nReturn your answer as JSON with a top-level object that contains a \'cards\' array that matches the provided schema exactly and includes exactly ${cardCount} item${cardCount === 1 ? "" : "s"}. Avoid repeating facts, keep content current, and make the cards rigorous but approachable. Include any helpful tag suggestions in the optional tags array.`
}

type AnkiCardOutput = z.infer<typeof AnkiCardSchema>

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
  cardFormat: z.enum(AnkiCardFormats),
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
):
  | { success: true; payload: GenerateAnkiDeckRequest }
  | {
      success: false
      issues: string[]
    } => {
  const validation = validateGenerateDeckRequest(input)

  if (!validation.success) {
    return validation
  }

  const payload: GenerateAnkiDeckRequest = {
    topicName: validation.payload.topicName,
    cardFormat: validation.payload.cardFormat,
    subtopic: validation.payload.subtopic,
    cardCount: validation.payload.cardCount
  }

  return {
    success: true,
    payload
  }
}

export const generateAnkiCards = async (
  config: AppConfig,
  request: GenerateAnkiDeckRequest
): Promise<AnkiCardOutput[]> => {
  const openai = createOpenAIProvider(config)
  const responseSchema = buildGenerationResponseSchema(
    request.cardFormat,
    request.cardCount
  )
  const system =
    "You are a helpful assistant that generates flashcards for FRM exam preparation."
  const prompt = buildGenerationPrompt(request)

  console.log("System:", system)
  console.log("Prompt:", prompt)
  console.log("Response schema:", responseSchema)

  const { object } = await generateObject({
    model: openai.responses("gpt-5-mini"),
    system,
    prompt,
    schema: responseSchema
  })

  console.log("Generated cards:", object)

  const validation = responseSchema.safeParse(object)

  if (!validation.success) {
    throw new Error(
      `Failed to validate generated cards: ${validation.error.message}`
    )
  }

  const cards = validation.data.cards.map((card) => {
    const parsed = AnkiCardSchema.parse(card)
    return parsed
  })

  return cards
}
