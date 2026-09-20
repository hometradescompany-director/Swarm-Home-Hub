# Atlas residence-event delivery

The residence journal is now the **outbox source of truth**.

Swarm does not perform a second "enqueue" write after a residence transition.
Every local residence event is already durable input for eventual Atlas
delivery. A delivery ledger records attempts and acknowledgements separately.

This removes the dangerous gap:

`local append → crash → outbound enqueue never happened`

and replaces it with:

`local event exists → no delivered receipt = pending → retry safely`

Atlas event identity is deterministically derived from the Swarm event identity.
If Atlas accepted a delivery but Swarm crashed before recording the local
delivery receipt, a later sweep replays the same Atlas event UUID. Atlas's
existing `atlas-event/v1` idempotency boundary returns the original landing
instead of creating a duplicate.

## Ownership gate

- **Owns:** Swarm owns local residence events and delivery-attempt receipts.
- **Knows:** only Atlas event acknowledgement ids and refusal/error text.
- **Emits:** the existing `swarm.residence.*` events through
  `atlas-event/v1`; no parallel domain events are invented.
- **Relationships:** source Swarm event → deterministic Atlas event id → Atlas
  record id / delivery receipt.

The included in-memory delivery ledger is a reference adapter for tests and
embedded runtimes. A production host must provide a durable implementation of
`AtlasDeliveryLedger`; the publisher semantics do not depend on its storage
technology.
