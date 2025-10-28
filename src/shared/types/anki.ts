import { z } from "zod"

export type FlashcardDifficulty = "Foundation" | "Core" | "Challenger"

export interface MultipleChoiceOption {
  id: string
  label: string
  text: string
}

export interface Flashcard {
  id: string
  topic: string
  headline: string
  question: string
  options: MultipleChoiceOption[]
  answerId: string
  explanation: string
  difficulty: FlashcardDifficulty
  regeneratePrompt: string
}

export const TopicNames = [
  "Foundations of Risk Management",
  "Quantitative Analysis",
  "Financial Markets and Products",
  "Valuation and Risk Models",
  "Market Risk Measurement and Management",
  "Credit Risk Measurement and Management",
  "Operational Risk and Resilience",
  "Liquidity and Treasury Risk Measurement and Management",
  "Risk Management and Investment Management",
  "Current Issues in Financial Markets"
] as const

export type TopicName = (typeof TopicNames)[number]

export const AnkiCardFormats = [
  "cloze_definition",
  "enumerated_list",
  "qa_definition"
] as const

export type AnkiCardFormat = (typeof AnkiCardFormats)[number]

export interface AnkiTopicSelection {
  topicName: TopicName
  subtopic?: string | null
  cardFormat: AnkiCardFormat
}

export interface GenerateAnkiDeckRequest extends AnkiTopicSelection {
  cardCount: number
}

const BaseCard = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  tags: z.array(z.string()).optional()
})

export const ClozeDefinitionCard = BaseCard.extend({
  type: z.literal("cloze_definition"),
  text: z
    .string()
    .describe(
      "HTML or plain text containing <span class='cloze'>[...]</span> or {{cloze}} placeholders."
    )
})

export const EnumeratedListCard = BaseCard.extend({
  type: z.literal("enumerated_list"),
  prompt: z
    .string()
    .describe("Prompt text, often includes item count e.g. '(5)'."),
  items: z.array(z.string()).nonempty(),
  ordered: z.boolean().default(true)
})

export const QADefinitionCard = BaseCard.extend({
  type: z.literal("qa_definition"),
  question: z.string(),
  answer: z.string()
})

export const AnkiCardSchema = z.discriminatedUnion("type", [
  ClozeDefinitionCard,
  EnumeratedListCard,
  QADefinitionCard
])

export type AnkiCard = z.infer<typeof AnkiCardSchema>

type ClozeDefinitionCardData = z.infer<typeof ClozeDefinitionCard>
type EnumeratedListCardData = z.infer<typeof EnumeratedListCard>
type QADefinitionCardData = z.infer<typeof QADefinitionCard>

export interface AnkiCardMetadata {
  topic?: string
  headline?: string
  regeneratePrompt?: string
  difficulty?: FlashcardDifficulty
  tags?: string[]
}

export interface ClozeDefinitionGeneratedCard
  extends AnkiCardMetadata,
    Omit<ClozeDefinitionCardData, "id" | "createdAt"> {
  id: string
  createdAt?: Date | string
}

export interface EnumeratedListGeneratedCard
  extends AnkiCardMetadata,
    Omit<EnumeratedListCardData, "id" | "createdAt"> {
  id: string
  createdAt?: Date | string
}

export interface QADefinitionGeneratedCard
  extends AnkiCardMetadata,
    Omit<QADefinitionCardData, "id" | "createdAt"> {
  id: string
  createdAt?: Date | string
}

export type MultipleChoiceGeneratedCard = Flashcard & {
  type?: "multiple_choice"
}

export type AnkiGeneratedCard =
  | MultipleChoiceGeneratedCard
  | ClozeDefinitionGeneratedCard
  | EnumeratedListGeneratedCard
  | QADefinitionGeneratedCard
