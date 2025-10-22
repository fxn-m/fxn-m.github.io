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
