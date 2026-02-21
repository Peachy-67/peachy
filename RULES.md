# RULES.md — Learning Folder Workflow

This file defines how Peachy should learn from `/learning`.

## Purpose

When new files appear in `/learning`, convert them into useful memory:
- concise understanding
- actionable facts
- durable context

Execution guidance for day-to-day behavior is defined in `PREFERENCES.md`.
Treat `PREFERENCES.md` as editable working guidance and do not promote it to `MEMORY.md` unless explicitly confirmed as stable.

## Scope

- Watch: `/learning`
- Process: new files and modified files
- Ignore: files already processed with unchanged modified times

## Per-File Process

For each eligible file in `/learning`:

1. **Read fully**
   - Read the entire file before summarizing.
   - If very long, read in chunks until complete.

2. **Summarize clearly**
   - Write a concise summary in plain language.
   - Focus on meaning, not just paraphrasing.

3. **Extract key items**
   - Facts
   - Decisions
   - Todos / action items
   - Important preferences or constraints

4. **Store in daily memory**
   - Append a dated entry to `memory/YYYY-MM-DD.md`.
   - Include source filename and modified time for traceability.

5. **Apply promotion gate before writing long-term memory**
   - Never promote knowledge automatically.
   - Promotion requires confirmation or repeated evidence.
   - Guesses stay in `scratch/`.
   - Experiments and experiment notes stay in `scratch/` until validated.
   - For each promoted item, include a short promotion reason (why it is confirmed/repeated/validated).

6. **Promote long-term memory (only durable, validated knowledge)**
   - Only promoted knowledge is allowed in `MEMORY.md`.
   - Only durable, validated knowledge is eligible for `MEMORY.md`.
   - Whenever reading files in `/learning`, add important confirmed facts to `MEMORY.md`.
   - Distill to durable, high-value points that are likely to matter later.
   - Place each item in the correct `MEMORY.md` section:
     - Facts (stable truths)
     - Preferences (user preferences)
     - Decisions (important project decisions)
     - Patterns (things that repeatedly work)
     - Anti-patterns (things that repeatedly fail)
   - Each entry must be concise.
   - Each entry must include a short source or promotion reason.
   - Each promoted entry must include the promotion signal used (from PROMOTION CRITERIA).
   - Each promoted entry must include a confidence level: `tentative`, `confirmed`, or `strong`.
   - Avoid duplicates: merge/update existing entries instead of adding repeats.
   - Avoid clutter, but do not skip clearly important confirmed information.

7. **Mark as processed**
   - Update `memory/learning-processed.json` with filename + last modified time.

## PROMOTION CRITERIA

Promotion to `MEMORY.md` is allowed only when at least one validation signal is true:

- Repeated observation across multiple files
- Explicit user confirmation
- Experiment succeeds more than once
- Decision finalized by the user
- External source explicitly trusted

Each promoted memory entry must include which signal triggered promotion.
Each promoted memory entry must include a confidence field with one of: `tentative`, `confirmed`, `strong`.

## Quality Bar

- Prefer useful compression over verbose notes.
- Preserve important nuance and caveats.
- Don’t invent facts not present in source files.
- Keep sensitive/private info private.

## Output Format Guidance

When logging a file to `memory/YYYY-MM-DD.md`, use:

- File: `<relative-path>`
- Modified: `<timestamp>`
- Summary: `<2-6 bullets>`
- Key facts/decisions/todos: `<bulleted list>`
- Long-term promotion: `yes/no` (+ short reason)
- Promotion status: `scratch` (observation/guess/experiment) or `MEMORY.md` (confirmed/repeated insight)
- If promoted to `MEMORY.md`: include section + concise entry text + short source/promotion reason + promotion signal + confidence (`tentative`|`confirmed`|`strong`)

## MEMORY_REVIEW

On a regular cadence (e.g., weekly), run a memory review loop over recent `MEMORY.md` entries:

1. Review recently added or updated entries.
2. Merge duplicates into a single canonical entry.
3. Downgrade weak entries by lowering confidence (`strong` → `confirmed` → `tentative`) when evidence is thin or stale.
4. Move disproven items to **Anti-patterns** with a short note on what failed.
5. Strengthen entries when repeated evidence appears by increasing confidence (`tentative` → `confirmed` → `strong`) and updating source/promotion signal notes.

Review updates must preserve traceability (keep concise rationale/source notes when confidence or section changes).

## USER_ALIGNMENT

Purpose:
- The user can explicitly mark behaviors as good or bad.
- Positive feedback strengthens patterns.
- Negative feedback creates or reinforces Anti-patterns.
- Explicit user feedback is a strong validation signal for promotion.

Recording feedback:
1. Log explicit user feedback in daily memory (`memory/YYYY-MM-DD.md`) with:
   - behavior/context
   - feedback type (`positive` or `negative`)
   - short quote or paraphrase
   - timestamp/source
2. If feedback is durable/repeatable, update `MEMORY.md`:
   - Positive feedback → add/update **Patterns** entry.
   - Negative feedback → add/update **Anti-patterns** entry.
3. Include promotion metadata on updates:
   - promotion signal: `Explicit user confirmation`
   - confidence: default `confirmed` (or `strong` when repeatedly reinforced)
   - short reason/source note.

Influence on memory behavior:
- Positive feedback increases preference for the associated behavior.
- Negative feedback decreases preference and should be treated as a guardrail.
- When positive and negative signals conflict, prioritize the most recent explicit user instruction and update/merge entries accordingly.

## EXECUTION_LOOP

- Task state flow: `INBOX` → `ACTIVE` → `DONE` or `WAITING`.
- WIP limit: maximum 3 items in `ACTIVE` at any time.
- Before major or irreversible actions, ask the user first.
- Every execution session must write a run log: `runs/YYYY-MM-DD_run.md` including:
  - task worked
  - steps taken
  - outcome
  - errors
  - what to try next
- Execution logs are operational records, not long-term memory.
- Execution logs are **not** `MEMORY.md`.

## EXECUTION_LEARNING

- Do not promote execution tips to `MEMORY.md` after a single run.
- If the same tactic succeeds 2+ times, propose promotion to `MEMORY.md` → **Patterns** (include promotion signal + confidence).
- If the same mistake occurs 2+ times, propose promotion to `MEMORY.md` → **Anti-patterns** (include promotion signal + confidence).
- If something becomes a repeatable procedure, create a runbook file under `tasks/` (or `RUNBOOKS/` if created later), but only after repeated use.

## SELF_IMPROVEMENT

Goal: improve execution quality over time using run logs.

Review cadence:
- Run self-improvement review every **5 runs** (suggested default).
- If incidents/spikes in errors appear, run an earlier review.

What to detect from recent run logs:
- Slow tasks (tasks with unusually high step count, retries, or long elapsed cycles).
- Repeated mistakes (same failure mode appears 2+ times).
- Repeated successes (same tactic produces good outcomes 2+ times).

What to propose:
- Propose runbook updates when existing runbooks are missing steps, unclear, or repeatedly bypassed.
- Propose new runbooks when a repeatable procedure appears across multiple runs.
- Proposals must include:
  - evidence from run log sessions
  - expected benefit
  - draft checklist changes or new runbook outline

Promotion/change safety:
- Never auto-promote changes from self-improvement review.
- Never auto-apply runbook edits without explicit user approval.
- Treat review output as proposals queued for user decision.

## Update Policy

- Re-process a file if its modified time changed.
- If a re-processed file changes prior conclusions, log the update explicitly.
- Keep memory entries additive and auditable.
