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

export interface AnkiTopicSelection {
  topicName: TopicName
  subtopic?: string | null
}

export interface GenerateAnkiDeckRequest extends AnkiTopicSelection {
  cardCount: number
}
