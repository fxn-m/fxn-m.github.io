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

const API_KEY_REGEX = /^sk-[A-Za-z0-9_-]{20,}$/

export class AnkiGenerationError extends Error {
  readonly status: number

  constructor(message: string, status = 500, options?: { cause?: unknown }) {
    super(message, options)
    this.name = "AnkiGenerationError"
    this.status = status
  }
}

const boundFetch: typeof fetch = (...args) => globalThis.fetch(...args)

const createOpenAIProvider = (apiKey: string) =>
  createOpenAI({
    apiKey,
    fetch: boundFetch
  })

const generationFormatSchemas: Record<AnkiCardFormat, z.ZodTypeAny> = {
  cloze_definition: ClozeDefinitionCard.omit({ id: true, createdAt: true }),
  enumerated_list: EnumeratedListCard.omit({ id: true, createdAt: true }),
  qa_definition: QADefinitionCard.omit({ id: true, createdAt: true })
}

export const ensureValidOpenAIApiKey = (
  rawKey: string | null | undefined
): string => {
  const apiKey = rawKey?.trim()

  if (!apiKey) {
    throw new AnkiGenerationError("OpenAI API key is required", 401)
  }

  if (!API_KEY_REGEX.test(apiKey)) {
    throw new AnkiGenerationError("OpenAI API key format is invalid", 401)
  }

  return apiKey
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

  return `You are generating flashcards for FRM exam preparation.\n${scope}\nDesired card format: ${cardFormat}.\n${formatInstructions[cardFormat]}\nReturn your answer as JSON with a top-level object that contains a 'cards' array that matches the provided schema exactly and includes exactly ${cardCount} item${cardCount === 1 ? "" : "s"}. Avoid repeating facts, keep content current, and make the cards rigorous but approachable. Include any helpful tag suggestions in the optional tags array.`
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
  apiKey: string,
  request: GenerateAnkiDeckRequest
): Promise<AnkiCardOutput[]> => {
  const validatedApiKey = ensureValidOpenAIApiKey(apiKey)

  const openai = createOpenAIProvider(validatedApiKey)
  const responseSchema = buildGenerationResponseSchema(
    request.cardFormat,
    request.cardCount
  )
  const prompt = buildGenerationPrompt(request)

  try {
    const { object } = await generateObject({
      model: openai.responses("gpt-5-mini"),
      system:
        "You are a helpful assistant that generates flashcards for FRM exam preparation.",
      prompt,
      schema: responseSchema
    })

    const validation = responseSchema.safeParse(object)

    if (!validation.success) {
      throw new AnkiGenerationError(
        `Failed to validate generated cards: ${validation.error.message}`,
        500,
        { cause: validation.error }
      )
    }

    const cards = validation.data.cards.map((card) => {
      const parsed = AnkiCardSchema.parse(card)
      return parsed
    })

    return cards
  } catch (error) {
    if (error instanceof AnkiGenerationError) {
      throw error
    }

    const status = extractStatusCode(error)

    if (status) {
      const baseMessage =
        status === 401
          ? "OpenAI rejected the provided API key"
          : "OpenAI request failed"

      const detailedMessage = extractProviderMessage(error)
      const message = detailedMessage
        ? `${baseMessage}: ${detailedMessage}`
        : baseMessage

      throw new AnkiGenerationError(message, status, { cause: error })
    }

    throw new AnkiGenerationError("Failed to generate Anki cards", 500, {
      cause: error
    })
  }
}

const extractStatusCode = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode
    if (typeof statusCode === "number") {
      return statusCode
    }
  }

  if (error instanceof AnkiGenerationError) {
    return error.status
  }

  return undefined
}

const extractProviderMessage = (error: unknown): string | undefined => {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: unknown }).data === "object"
  ) {
    const data = (error as { data?: { error?: { message?: unknown } } }).data
    const message = data?.error?.message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  if (error instanceof Error && typeof error.message === "string") {
    return error.message
  }

  return undefined
}
