# ARCHITECTURE.md — Peachy Recovery Snapshot

Purpose: recreate this agent workspace on a new machine with minimal ambiguity.

## Folder structure (high level)
- `RULES.md` — operating policy for learning, promotion, execution, safety.
- `PREFERENCES.md` — execution style defaults (concise, structured, practical).
- `MEMORY.md` — long-term curated knowledge (validated only).
- `RUNBOOKS/` — repeatable operating checklists (e.g., `decision-quality.md`).
- `tasks/` — task board state (`INBOX`, `ACTIVE`, `WAITING`, `DONE`, `TASKS_LOG`).
- `runs/` — per-day execution logs (`YYYY-MM-DD_run.md`).
- `learning/` — incoming source files for ingestion.
- `scratch/` — non-promoted notes, guesses, experiments, staging.
- `memory/` — dated memory logs + ingestion tracker (`learning-processed.json`).

## Core file purposes
- `RULES.md`: source of truth for behavior gates and workflows.
- `MEMORY.md`: durable truths, preferences, decisions, patterns, anti-patterns.
- `PREFERENCES.md`: editable execution guidance; not long-term memory by default.
- `RUNBOOKS/*`: stable procedural checklists created after repeated use.
- `tasks/*`: active workflow control and audit trail of state transitions.
- `runs/*`: execution-session evidence (steps, outcomes, errors, next actions).
- `learning/*`: knowledge inputs to process.
- `scratch/*`: temporary or unvalidated knowledge.

## Execution loop design
- Required flow: `INBOX → ACTIVE → DONE` or `WAITING`.
- WIP limit: max 3 items in `ACTIVE`.
- Ask user before major/irreversible actions.
- Every execution session must update `runs/YYYY-MM-DD_run.md` with:
  - task worked
  - steps taken
  - outcome
  - errors
  - what to try next
- `runs/` logs are operational, not long-term memory.

## Learning pipeline design
1. Detect new/changed files in `learning/`.
2. Read file fully.
3. Summarize and extract facts/decisions/todos.
4. Log ingestion to `memory/YYYY-MM-DD.md`.
5. Put uncertain/single-source items in `scratch/`.
6. Record processed metadata in `memory/learning-processed.json`.
7. Promote to `MEMORY.md` only when criteria are met.

## Promotion rules (what becomes MEMORY)
Allowed only for durable, validated knowledge.
Validation signal must include at least one:
- repeated observation across multiple files
- explicit user confirmation
- experiment succeeds more than once
- decision finalized by user
- explicitly trusted external source

Required metadata for each promoted entry:
- short source or promotion reason
- promotion signal
- confidence (`tentative` | `confirmed` | `strong`)

Never store guesses directly in `MEMORY.md`.

## Self-improvement model
- Run review every 5 runs (default) or earlier on error spikes.
- Detect:
  - slow tasks (high steps, repeated tool failures, repeated ask-user loops)
  - repeated mistakes (2+)
  - repeated successes (2+)
- Output proposals for runbook updates/new runbooks.
- Every proposal must include:
  - evidence links (run ids)
  - expected benefit
  - risk
  - rollback plan
- No auto-promotion and no auto-apply; user approval required.

## Safety rules
- Approval required before major or irreversible actions.
- Never auto-promote knowledge changes.
- Never auto-apply self-improvement/runbook changes.
- Keep sensitive or uncertain information out of long-term memory.

## Bootstrap from empty repo
1. Create folders: `learning/`, `scratch/`, `memory/`, `tasks/`, `runs/`, `RUNBOOKS/`.
2. Create core files: `RULES.md`, `PREFERENCES.md`, `MEMORY.md`, task board files, `ARCHITECTURE.md`.
3. Initialize task board templates and execution loop rules.
4. Add initial runbook(s) only after repeated procedure evidence.
5. Add ingestion tracker: `memory/learning-processed.json`.
6. Process first learning file via pipeline and verify promotion gate behavior.
7. Commit baseline and continue with execution-loop discipline.
