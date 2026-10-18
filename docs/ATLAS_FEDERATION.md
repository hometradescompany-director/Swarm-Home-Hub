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
- `AtlasResidenceEventPublisher` and the `atlas-event/v1` HTTP sink implement
  journal-backed, replayable residence-event delivery. The journal is the
  outbox source; there is no second enqueue write. Production delivery remains
  unavailable until a host supplies durable journal and delivery-ledger
  adapters and owns the retry sweep. The in-memory adapters are for tests and
  embedded runtimes only; see [ATLAS_EVENT_DELIVERY.md](ATLAS_EVENT_DELIVERY.md).
- No shared database handle, service role, human PII or Atlas registry schema
  crosses the boundary.

These are typed absences, not implied functionality.
