# Atlas federation boundary

Contract: `SwarmAtlasFederation/v1`

Swarm Home Hub remains the canonical owner of residence lifecycle, habitat
capacity, rest/readiness and ready-handoff state. Atlas supplies two narrow
services through its existing Gateway:

1. `atlas-entity/v1` resolve-or-create for an opaque `agent_identity`; and
2. `atlas-authority/v1` for the single `swarm.residence.enter` question.

A positive Atlas decision is **not** admission. `AdmissionService` still
applies Swarm's own habitat capacity and lifecycle policy after the Atlas
decision. Connection therefore cannot become product authority by accident.

## Deliberately absent in v1

- Evidence retrieval is fail-closed for non-empty receipt requests because Atlas
  does not yet expose a dedicated evidence endpoint for this seam.
- Swarm residence events are not pushed to Atlas yet. A durable outbox/retry
  boundary must exist before event delivery is enabled; appending locally and
  then attempting best-effort HTTP would create an avoidable half-commit.
- No shared database handle, service role, human PII or Atlas registry schema
  crosses the boundary.

These are typed absences, not implied functionality.
