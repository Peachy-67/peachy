# Execution Review Runbook

Goal: standardize self-improvement reviews using run logs.

## Inputs
- Primary source: recent run logs in `runs/`.
- Default review window: last 5 sessions (or last full `runs/YYYY-MM-DD_run.md` if fewer).
- Include any session marked with errors, retries, or blockers.

## Detection checklist

### Slow tasks
- [ ] Flag sessions with unusually high step count.
- [ ] Flag repeated tool failures in one session.
- [ ] Flag repeated "ask user" loops without forward progress.
- [ ] Record affected run ids + short evidence note.

### Repeated mistakes
- [ ] Identify failure modes seen in 2+ sessions.
- [ ] Confirm same root pattern (not just similar wording).
- [ ] Capture run ids where pattern appears.
- [ ] Propose guardrail or checklist update.

### Repeated successes
- [ ] Identify tactics that produced good outcomes in 2+ sessions.
- [ ] Confirm tactic is repeatable across contexts.
- [ ] Capture run ids where success appears.
- [ ] Propose runbook codification or template improvement.

## Proposal output format
For each proposal, include:
- Evidence links (run ids)
- Expected benefit
- Risk
- Rollback plan
- Suggested change (runbook update or new runbook outline)

## Safety
- Never auto-apply proposed changes.
- Never auto-promote proposals to `MEMORY.md`.
- Submit proposals for explicit user approval first.
