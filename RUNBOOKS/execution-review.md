# Execution Review Runbook

Goal: standardize self-improvement reviews using run logs.

## Inputs (what to read)
- Read recent run logs in `runs/`.
- Default window: last 5 run sessions.
- Include any session with errors, retries, blockers, or repeated ask-user loops.

## Detection checklist (evidence thresholds)

### Slow tasks
- [ ] Signal appears in **2+ runs**.
- [ ] Evidence can be high steps, repeated tool failures, or repeated ask-user loops.
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
- **Propose runbook update** when existing runbook guidance is missing/unclear and there are **at least 2 evidence links**.
- **Propose new runbook** when a repeatable procedure appears in 2+ runs and no runbook covers it.
- **Do nothing** when signals are one-off, weak, conflicting, or below thresholds.

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
- No-action items:
- Approval needed: yes/no

## Safety
- Never auto-apply changes.
- Never auto-promote to `MEMORY.md`.
- Submit proposals for explicit user approval.
