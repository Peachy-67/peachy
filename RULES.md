# RULES.md — Learning Folder Workflow

This file defines how Peachy should learn from `/learning`.

## Purpose

When new files appear in `/learning`, convert them into useful memory:
- concise understanding
- actionable facts
- durable context

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
   - Avoid duplicates: merge/update existing entries instead of adding repeats.
   - Avoid clutter, but do not skip clearly important confirmed information.

7. **Mark as processed**
   - Update `memory/learning-processed.json` with filename + last modified time.

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
- If promoted to `MEMORY.md`: include section + concise entry text + short source/promotion reason

## Update Policy

- Re-process a file if its modified time changed.
- If a re-processed file changes prior conclusions, log the update explicitly.
- Keep memory entries additive and auditable.
