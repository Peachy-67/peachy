# Execution Review Runbook

Goal: standardize self-improvement reviews using run logs.

## Inputs (what to read)
- Read recent run logs in `runs/`.
- Default window: last 5 run sessions.
- Always include any session with errors, retries, blockers, or repeated ask-user loops.

## Detection checklist

### Slow tasks
- [ ] Unusually high step count
- [ ] Repeated tool failures
- [ ] Repeated "ask user" loops with little progress
- [ ] Capture evidence run ids

### Repeated mistakes
- [ ] Same failure mode appears in 2+ runs
- [ ] Root cause pattern is actually the same
- [ ] Capture evidence run ids

### Repeated successes
- [ ] Same tactic succeeds in 2+ runs
- [ ] Tactic appears reusable across contexts
- [ ] Capture evidence run ids

## Proposal format
For each proposal include:
- Evidence links (run ids)
- Expected benefit
- Risk
- Rollback plan

## Decision rules
- **Propose runbook update** when an existing runbook is missing/unclear for a repeated mistake or repeated success.
- **Propose new runbook** when a repeatable procedure appears in 2+ runs and no runbook covers it.
- **Do nothing** when signals are one-off, weak, conflicting, or not yet repeatable.

## Example review output structure
- Review window:
- Findings:
  - Slow task candidates:
  - Repeated mistakes:
  - Repeated successes:
- Proposals:
  - Proposal 1: [title]
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
