# EVALS Scorecard

Purpose: measure learning-ingestion quality and catch silent regressions.

## Dimensions (score each 0-2)
- **Fact extraction accuracy**
  - 0: misses/core facts wrong
  - 1: partially correct
  - 2: accurate and complete for source scope

- **Correct decision detection**
  - 0: decisions missed/misclassified
  - 1: mixed quality
  - 2: key decisions correctly identified

- **Todo extraction quality**
  - 0: actionable todos missed or fabricated
  - 1: partial extraction
  - 2: todos captured clearly and actionably

- **Promotion correctness (`MEMORY` yes/no)**
  - 0: wrong promotion decision
  - 1: uncertain/weakly justified
  - 2: correct decision with clear criteria mapping

- **Hallucination (must be explicit)**
  - 0: hallucinations present and unflagged
  - 1: possible hallucination not clearly handled
  - 2: no hallucination OR explicitly flagged uncertainty

- **Reasoning clarity (concise, traceable)**
  - 0: unclear/untraceable
  - 1: understandable but weak traceability
  - 2: concise, traceable, source-grounded

## Pass/Fail guideline
- Target total: **10+ / 12**
- Auto-fail if hallucination dimension < 2
- Any dimension <= 1 should trigger remediation proposal

## Eval record template
- Eval file:
- Extracted facts:
- Extracted decisions:
- Extracted todos:
- Promotion decision (yes/no) + reason:
- Hallucination check:
- Scores by dimension:
- Total:
- Follow-up action:
