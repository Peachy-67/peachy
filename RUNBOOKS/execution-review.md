# Execution Review Runbook

Goal: standardize self-improvement reviews using run logs.

## Inputs (what to read)
- Read recent run logs in `runs/`.
- Default window: last 5 run sessions.
- Include sessions with errors, retries, blockers, or repeated ask-user loops.

## Detection checklist (evidence thresholds)

### Slow tasks
- [ ] Signal appears in **2+ runs**.
- [ ] Evidence: unusually high steps, repeated tool failures, or repeated ask-user loops.
- [ ] Capture run ids.

### Repeated mistakes
- [ ] Same failure mode appears in **2+ runs**.
- [ ] Root cause pattern is genuinely the same.
- [ ] Capture run ids.

### Repeated successes
- [ ] Same tactic produces positive outcomes in **2+ runs**.
- [ ] Tactic is reusable across contexts.
- [ ] Capture run ids.

## Proposal format
For each proposal include:
- Evidence links (run ids)
- Expected benefit
- Risk
- Rollback plan

## Decision rules
- **Propose runbook update** when existing guidance is missing/unclear and there are **at least 2 evidence links**.
- **Propose new runbook** when a repeatable procedure appears in 2+ runs and no runbook covers it.
- **Do nothing** when signals are weak, one-off, conflicting, or below threshold.

## NO_CHANGE_RULES
- Do not propose changes if evidence is weak (only 1 run).
- Do not propose changes during active debugging sessions.
- Do not propose runbook edits for one-off tasks.
- Prefer observation mode when uncertainty is high.
- When unsure, log observation instead of proposing change.

## PROPOSAL_CONFIDENCE
- **weak**: evidence in 1 run → observation only.
- **candidate**: appears in 2 runs → may propose with caution.
- **strong**: appears in 3+ runs → safe to recommend runbook change.

Rules:
- Weak → log only.
- Candidate → propose with caution.
- Strong → recommend runbook change.

## Example review output structure
- Review window:
- Findings:
  - Slow tasks:
  - Repeated mistakes:
  - Repeated successes:
- Proposals:
  - Proposal: [title]
    - Evidence (run ids):
    - Expected benefit:
    - Risk:
    - Rollback plan:
- Observation-only notes:
- No-action items:
- Approval needed: yes/no

## Safety
- Never auto-apply changes.
- Never auto-promote to `MEMORY.md`.
- Submit proposals for explicit user approval.
