<script setup lang="ts">
  import { computed, ref } from "vue"

  import AnkiApiKeyControl from "@/client/components/fun/AnkiApiKeyControl.vue"
  import { Button } from "@/client/components/ui/button"
  import { Input } from "@/client/components/ui/input"
  import { Label } from "@/client/components/ui/label"
  import type { Flashcard } from "@/shared/types"

  const API_KEY_STORAGE_KEY = "ankipanki:openai-api-key"

  const topicSeed = ref("")
  const cards = ref<Flashcard[]>([])
  const isGenerating = ref(false)
  const generationError = ref<string | null>(null)
  const regeneratingCardId = ref<string | null>(null)

  const labelTone =
    "text-[10px] uppercase tracking-[0.45em] text-neutral-600 dark:text-neutral-400"
  const footnoteTone =
    "text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-500"
  const inputTone =
    "border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus-visible:border-neutral-400 dark:focus-visible:border-neutral-600 focus-visible:ring-0"
  const primaryButtonTone =
    "border border-neutral-900/20 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:border-neutral-100/40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
  const outlineButtonTone =
    "border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/60"

  const showEmptyState = computed(
    () => !cards.value.length && !isGenerating.value
  )

  const wait = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms)
    })

  const uid = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID()
    }
    return Math.random().toString(36).slice(2)
  }

  type Blueprint = {
    headline: string
    question: string
    options: string[]
    answerIndex: number
    explanation: string
    difficulty: Flashcard["difficulty"]
  }

  const BLUEPRINTS: Blueprint[] = [
    {
      headline: "Value-at-Risk Fundamentals",
      question:
        "Which Value-at-Risk (VaR) methodology best captures non-linear payoffs for a portfolio concentrated in options on {{topic}}?",
      options: [
        "Variance-Covariance (Delta-Normal) VaR with delta approximation",
        "Historical Simulation VaR using equally weighted scenarios",
        "Monte Carlo Simulation VaR with full revaluation",
        "Cornish-Fisher Expansion applied to standardized returns"
      ],
      answerIndex: 2,
      explanation:
        "Full revaluation via Monte Carlo simulation flexibly models path-dependent and non-linear payoffs, which dominate option-heavy exposures. Variance-covariance assumes normality, historical simulation may under-sample extreme states, and Cornish-Fisher still relies on polynomial adjustments.",
      difficulty: "Core"
    },
    {
      headline: "Stress Testing Discipline",
      question:
        "A risk manager preparing the {{topic}} desk for regulatory CCAR stress testing wants to prioritize scenarios that are both severe and plausible. What is the most defensible starting point?",
      options: [
        "Replay the worst historical drawdown suffered by the desk",
        "Construct hypothetical shocks calibrated to supervisory narratives",
        "Optimize a scenario that maximizes VaR breach probability",
        "Blend multiple historical events into a hybrid mega-scenario"
      ],
      answerIndex: 1,
      explanation:
        "Supervisory-designed narratives anchor CCAR, so aligning with regulator-provided macroeconomic and market trajectories gives the most defensible baseline before layering internal overlays. Sole reliance on history, optimization, or hybrids risks misalignment with regulatory expectations.",
      difficulty: "Foundation"
    },
    {
      headline: "Liquidity Coverage Metrics",
      question:
        "For the {{topic}} trading unit, which cash flow adjustment is required when calculating the Liquidity Coverage Ratio (LCR)?",
      options: [
        "Apply a 100% run-off rate to all Level 1 High Quality Liquid Assets",
        "Use a 0% inflow cap for secured lending maturing within 30 days",
        "Limit total cash inflows to 75% of total cash outflows over 30 days",
        "Exclude derivative-related collateral calls from projected outflows"
      ],
      answerIndex: 2,
      explanation:
        "The Basel III LCR restricts recognized inflows to 75% of outflows, ensuring banks maintain sufficient High Quality Liquid Assets to absorb residual net outflows. Other statements misstate regulatory treatment of Level 1 assets, secured lending inflows, or collateral requirements.",
      difficulty: "Foundation"
    },
    {
      headline: "Counterparty Credit Analytics",
      question:
        "When estimating Potential Future Exposure (PFE) for the {{topic}} swap book, which modelling enhancement most improves tail fidelity under wrong-way risk?",
      options: [
        "Increase the confidence interval from 95% to 99.9%",
        "Incorporate joint simulations of market factors and counterparty credit quality",
        "Extend the margin period of risk to capture settlement delays",
        "Calibrate exposure profiles with a longer historical window"
      ],
      answerIndex: 1,
      explanation:
        "Jointly modelling market drivers with counterparty credit quality captures adverse co-movements emblematic of wrong-way risk. Simply widening confidence levels, lengthening margin periods, or extending history fails to address correlation under stress.",
      difficulty: "Core"
    },
    {
      headline: "Operational Loss Controls",
      question:
        "The {{topic}} operations team logged a spike in near-miss incidents involving manual reconciliations. Which control redesign best aligns with FRM operational risk expectations?",
      options: [
        "Transition to detective controls with post-trade reconciliations",
        "Introduce automated matching with dual-authorization overrides",
        "Create an incident response playbook emphasizing rapid escalation",
        "Increase capital allocation to the operational risk buffer"
      ],
      answerIndex: 1,
      explanation:
        "Automated matching augmented with maker-checker overrides reduces human error at source, consistent with FRM guidance on preventive controls. Solely detective monitoring, reactive playbooks, or capital buffers do not mitigate the process breakdown.",
      difficulty: "Challenger"
    },
    {
      headline: "Model Risk Governance",
      question:
        "Which governance action most strengthens the {{topic}} unit's annual model validation refresh for pricing analytics?",
      options: [
        "Rotate validation ownership between front office quants",
        "Expand backtesting coverage with challenger models and override tracking",
        "Shorten the validation memo to focus on headline metrics",
        "Escalate all model adjustments above $1M to the board"
      ],
      answerIndex: 1,
      explanation:
        "Enhancing backtesting with challenger models plus transparent override inventories gives senior oversight the evidence needed to assess residual model risk. Rotations, shorter memos, or indiscriminate escalations dilute governance effectiveness.",
      difficulty: "Core"
    }
  ]

  const buildCard = (seed: string, blueprint: Blueprint): Flashcard => {
    const topic = seed.trim().length ? seed.trim() : "market risk"

    return {
      id: uid(),
      topic,
      headline: blueprint.headline,
      question: blueprint.question.replace("{{topic}}", topic),
      options: blueprint.options.map((text, optionIndex) => ({
        id: uid(),
        label: String.fromCharCode(65 + optionIndex),
        text
      })),
      answerId: String.fromCharCode(65 + blueprint.answerIndex),
      explanation: blueprint.explanation,
      difficulty: blueprint.difficulty,
      regeneratePrompt: ""
    }
  }

  const createDeck = (seed: string): Flashcard[] => {
    return BLUEPRINTS.slice(0, 5).map((blueprint, index) => {
      const rotation =
        (index + Math.floor(Math.random() * BLUEPRINTS.length)) %
        BLUEPRINTS.length
      return buildCard(seed, BLUEPRINTS[rotation])
    })
  }

  const handleGenerate = async () => {
    generationError.value = null
    const seed = topicSeed.value.trim()

    if (!seed.length) {
      generationError.value =
        "Add a concept, regulation, or desk to seed the deck."
      return
    }

    isGenerating.value = true

    try {
      await wait(700)
      cards.value = createDeck(seed)
    } catch (error) {
      generationError.value = "Could not sketch the deck. Try again."
      console.error(error)
    } finally {
      isGenerating.value = false
    }
  }

  const handleCardUpdate = (nextCard: Flashcard) => {
    cards.value = cards.value.map((card) =>
      card.id === nextCard.id ? nextCard : card
    )
  }

  const handleRegenerateCard = async (cardId: string) => {
    const currentCard = cards.value.find((card) => card.id === cardId)

    if (!currentCard) {
      return
    }

    const seed = currentCard.regeneratePrompt.trim() || currentCard.topic

    regeneratingCardId.value = cardId

    try {
      await wait(500)
      const replacements = createDeck(seed)
      const nextCard =
        replacements[Math.floor(Math.random() * replacements.length)]

      cards.value = cards.value.map((card) =>
        card.id === cardId
          ? {
              ...nextCard,
              regeneratePrompt: ""
            }
          : card
      )
    } finally {
      regeneratingCardId.value = null
    }
  }
</script>

<template>
  <div
    class="relative justify-center flex h-full w-full flex-1 flex-col gap-10"
  >
    <AnkiApiKeyControl
      :storage-key="API_KEY_STORAGE_KEY"
      class="absolute right-0 md:top-4"
    />
    <section
      class="relative flex flex-col gap-6 border-b border-neutral-200/70 bg-white/80 p-10 text-neutral-900 dark:border-neutral-800/70 dark:bg-inherit dark:text-neutral-100"
    >
      <div class="grid gap-3">
        <Label for="topic-seed" :class="labelTone">Input Topic</Label>
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            id="topic-seed"
            v-model="topicSeed"
            :disabled="isGenerating"
            placeholder="e.g. Structured credit desk, counterparty XVA, liquidity risk"
            :class="[inputTone, 'md:flex-1']"
          />
          <Button
            variant="outline"
            :class="[primaryButtonTone, 'md:w-fit']"
            :disabled="isGenerating"
            type="button"
            @click="handleGenerate"
          >
            {{ isGenerating ? "Drafting..." : "Generate 5 Cards" }}
          </Button>
        </div>
        <p
          v-if="generationError"
          class="text-xs text-rose-500 dark:text-rose-400"
        >
          {{ generationError }}
        </p>
      </div>
    </section>

    <div
      v-if="showEmptyState"
      class="flex flex-col items-center gap-4 text-neutral-500 dark:text-neutral-400"
    >
      <span class="text-[11px] uppercase tracking-[0.6em]"> No cards yet </span>
      <p
        class="max-w-sm text-center text-xs text-neutral-500 dark:text-neutral-400"
      >
        Input a topic to generate five multiple-choice flashcards. You can tweak
        them and export them to anki.
      </p>
    </div>

    <div v-else class="grid gap-8">
      <transition-group name="card-fade" tag="div" class="grid gap-8">
        <AnkiCardEditor
          v-for="(card, index) in cards"
          :key="card.id"
          :card="card"
          :index="index"
          :label-tone="labelTone"
          :input-tone="inputTone"
          :outline-button-tone="outlineButtonTone"
          :footnote-tone="footnoteTone"
          :regenerating-card-id="regeneratingCardId"
          @update:card="handleCardUpdate"
          @regenerate="handleRegenerateCard"
        />
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .card-fade-enter-active,
  .card-fade-leave-active {
    transition: all 0.35s ease;
  }
  .card-fade-enter-from {
    opacity: 0;
    transform: translateY(12px);
  }
  .card-fade-leave-to {
    opacity: 0;
    transform: translateY(-12px);
  }
</style>
