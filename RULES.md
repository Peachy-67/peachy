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

5. **Promote long-term memory (when warranted)**
   - If information is durable and broadly useful, add distilled notes to `MEMORY.md`.
   - Avoid clutter: only include items likely to matter later.

6. **Mark as processed**
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
- Long-term promotion: `yes/no` (+ brief reason)

## Update Policy

- Re-process a file if its modified time changed.
- If a re-processed file changes prior conclusions, log the update explicitly.
- Keep memory entries additive and auditable.
