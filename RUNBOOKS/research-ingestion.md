# Research Ingestion Runbook

Goal: turn files in `research/sources/` into structured notes.

## Procedure
1. Read the full source file before summarizing.
2. Write note to `research/notes/<same-name>.md`.
3. Extract and structure:
   - key ideas
   - claims
   - evidence
   - definitions
   - open questions

## Opportunity signal detection (required)
After each new research or learning ingestion:
1. Check playbooks in `research/opportunities/playbooks/`.
2. Detect opportunity signals (repetition, pain, automation potential, reusability, output ownership, visibility potential).
3. Log detected signals to `research/opportunities/signals/<YYYY-MM-DD>_<source-name>-signals.md`.

## Rules
- Do **not** promote research notes to `MEMORY.md` automatically.
- If a cross-source insight appears, write it to `research/syntheses/`.
- If uncertainty remains, add it to `research/questions/`.
- Keep notes concise, source-grounded, and traceable.
