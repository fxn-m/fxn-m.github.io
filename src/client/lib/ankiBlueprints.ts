import type { Flashcard } from "@/shared/types"

export const BLUEPRINTS: Flashcard[] = [
  {
    id: "blueprint-var-fundamentals",
    topic: "{{topic}}",
    headline: "Value-at-Risk Fundamentals",
    question:
      "Which Value-at-Risk (VaR) methodology best captures non-linear payoffs for a portfolio concentrated in options on {{topic}}?",
    options: [
      {
        id: "blueprint-var-fundamentals-option-a",
        label: "A",
        text: "Variance-Covariance (Delta-Normal) VaR with delta approximation"
      },
      {
        id: "blueprint-var-fundamentals-option-b",
        label: "B",
        text: "Historical Simulation VaR using equally weighted scenarios"
      },
      {
        id: "blueprint-var-fundamentals-option-c",
        label: "C",
        text: "Monte Carlo Simulation VaR with full revaluation"
      },
      {
        id: "blueprint-var-fundamentals-option-d",
        label: "D",
        text: "Cornish-Fisher Expansion applied to standardized returns"
      }
    ],
    answerId: "C",
    explanation:
      "Full revaluation via Monte Carlo simulation flexibly models path-dependent and non-linear payoffs, which dominate option-heavy exposures. Variance-covariance assumes normality, historical simulation may under-sample extreme states, and Cornish-Fisher still relies on polynomial adjustments.",
    difficulty: "Core",
    regeneratePrompt: ""
  },
  {
    id: "blueprint-stress-testing-discipline",
    topic: "{{topic}}",
    headline: "Stress Testing Discipline",
    question:
      "A risk manager preparing the {{topic}} desk for regulatory CCAR stress testing wants to prioritize scenarios that are both severe and plausible. What is the most defensible starting point?",
    options: [
      {
        id: "blueprint-stress-testing-discipline-option-a",
        label: "A",
        text: "Replay the worst historical drawdown suffered by the desk"
      },
      {
        id: "blueprint-stress-testing-discipline-option-b",
        label: "B",
        text: "Construct hypothetical shocks calibrated to supervisory narratives"
      },
      {
        id: "blueprint-stress-testing-discipline-option-c",
        label: "C",
        text: "Optimize a scenario that maximizes VaR breach probability"
      },
      {
        id: "blueprint-stress-testing-discipline-option-d",
        label: "D",
        text: "Blend multiple historical events into a hybrid mega-scenario"
      }
    ],
    answerId: "B",
    explanation:
      "Supervisory-designed narratives anchor CCAR, so aligning with regulator-provided macroeconomic and market trajectories gives the most defensible baseline before layering internal overlays. Sole reliance on history, optimization, or hybrids risks misalignment with regulatory expectations.",
    difficulty: "Foundation",
    regeneratePrompt: ""
  },
  {
    id: "blueprint-liquidity-coverage-metrics",
    topic: "{{topic}}",
    headline: "Liquidity Coverage Metrics",
    question:
      "For the {{topic}} trading unit, which cash flow adjustment is required when calculating the Liquidity Coverage Ratio (LCR)?",
    options: [
      {
        id: "blueprint-liquidity-coverage-metrics-option-a",
        label: "A",
        text: "Apply a 100% run-off rate to all Level 1 High Quality Liquid Assets"
      },
      {
        id: "blueprint-liquidity-coverage-metrics-option-b",
        label: "B",
        text: "Use a 0% inflow cap for secured lending maturing within 30 days"
      },
      {
        id: "blueprint-liquidity-coverage-metrics-option-c",
        label: "C",
        text: "Limit total cash inflows to 75% of total cash outflows over 30 days"
      },
      {
        id: "blueprint-liquidity-coverage-metrics-option-d",
        label: "D",
        text: "Exclude derivative-related collateral calls from projected outflows"
      }
    ],
    answerId: "C",
    explanation:
      "The Basel III LCR restricts recognized inflows to 75% of outflows, ensuring banks maintain sufficient High Quality Liquid Assets to absorb residual net outflows. Other statements misstate regulatory treatment of Level 1 assets, secured lending inflows, or collateral requirements.",
    difficulty: "Foundation",
    regeneratePrompt: ""
  },
  {
    id: "blueprint-counterparty-credit-analytics",
    topic: "{{topic}}",
    headline: "Counterparty Credit Analytics",
    question:
      "When estimating Potential Future Exposure (PFE) for the {{topic}} swap book, which modelling enhancement most improves tail fidelity under wrong-way risk?",
    options: [
      {
        id: "blueprint-counterparty-credit-analytics-option-a",
        label: "A",
        text: "Increase the confidence interval from 95% to 99.9%"
      },
      {
        id: "blueprint-counterparty-credit-analytics-option-b",
        label: "B",
        text: "Incorporate joint simulations of market factors and counterparty credit quality"
      },
      {
        id: "blueprint-counterparty-credit-analytics-option-c",
        label: "C",
        text: "Extend the margin period of risk to capture settlement delays"
      },
      {
        id: "blueprint-counterparty-credit-analytics-option-d",
        label: "D",
        text: "Calibrate exposure profiles with a longer historical window"
      }
    ],
    answerId: "B",
    explanation:
      "Jointly modelling market drivers with counterparty credit quality captures adverse co-movements emblematic of wrong-way risk. Simply widening confidence levels, lengthening margin periods, or extending history fails to address correlation under stress.",
    difficulty: "Core",
    regeneratePrompt: ""
  },
  {
    id: "blueprint-operational-loss-controls",
    topic: "{{topic}}",
    headline: "Operational Loss Controls",
    question:
      "The {{topic}} operations team logged a spike in near-miss incidents involving manual reconciliations. Which control redesign best aligns with FRM operational risk expectations?",
    options: [
      {
        id: "blueprint-operational-loss-controls-option-a",
        label: "A",
        text: "Transition to detective controls with post-trade reconciliations"
      },
      {
        id: "blueprint-operational-loss-controls-option-b",
        label: "B",
        text: "Introduce automated matching with dual-authorization overrides"
      },
      {
        id: "blueprint-operational-loss-controls-option-c",
        label: "C",
        text: "Create an incident response playbook emphasizing rapid escalation"
      },
      {
        id: "blueprint-operational-loss-controls-option-d",
        label: "D",
        text: "Increase capital allocation to the operational risk buffer"
      }
    ],
    answerId: "B",
    explanation:
      "Automated matching augmented with maker-checker overrides reduces human error at source, consistent with FRM guidance on preventive controls. Solely detective monitoring, reactive playbooks, or capital buffers do not mitigate the process breakdown.",
    difficulty: "Challenger",
    regeneratePrompt: ""
  },
  {
    id: "blueprint-model-risk-governance",
    topic: "{{topic}}",
    headline: "Model Risk Governance",
    question:
      "Which governance action most strengthens the {{topic}} unit's annual model validation refresh for pricing analytics?",
    options: [
      {
        id: "blueprint-model-risk-governance-option-a",
        label: "A",
        text: "Rotate validation ownership between front office quants"
      },
      {
        id: "blueprint-model-risk-governance-option-b",
        label: "B",
        text: "Expand backtesting coverage with challenger models and override tracking"
      },
      {
        id: "blueprint-model-risk-governance-option-c",
        label: "C",
        text: "Shorten the validation memo to focus on headline metrics"
      },
      {
        id: "blueprint-model-risk-governance-option-d",
        label: "D",
        text: "Escalate all model adjustments above $1M to the board"
      }
    ],
    answerId: "B",
    explanation:
      "Enhancing backtesting with challenger models plus transparent override inventories gives senior oversight the evidence needed to assess residual model risk. Rotations, shorter memos, or indiscriminate escalations dilute governance effectiveness.",
    difficulty: "Core",
    regeneratePrompt: ""
  }
]
