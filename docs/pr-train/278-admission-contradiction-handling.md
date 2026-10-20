# PR Train Slot 278: Admission contradiction handling

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define how Swarm reacts when authority evidence, local policy state, or capacity observations conflict during an admission attempt.

## Boundary
Contradiction blocks unsafe admission and remains explicit evidence; it is not silently resolved in favor of convenience.

## Gate
Reuse typed contradiction/absence primitives. Preserve each conflicting source, observation time, policy version, and resulting refusal path.

## Falsification
Reject if one source is discarded silently, contradiction is converted to denial without provenance, capacity conflicts are retried as success, or history is rewritten after reconciliation.

Implementation status: **not implemented in this PR**.
