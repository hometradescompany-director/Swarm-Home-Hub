# Swarm Home Hub operational runbook

## Severity
- SEV-1: authority bypass, provenance corruption, unsafe tool routing, or destructive journal/state corruption.
- SEV-2: residence lifecycle or platform door materially unavailable.
- SEV-3: bounded degradation with safe fallback.

## First response
1. Stop the affected transport/tool path if authority is uncertain.
2. Preserve journal events, provenance receipts, source commit, and failing input.
3. Do not repair by mutating historical events.
4. Roll back to the last known-good release if safer than live repair.
5. Re-run residence-phase and full checks before restoration.

Until a formal on-call rotation exists, repository ownership is the escalation path.
