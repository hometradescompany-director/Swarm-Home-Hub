# PR Train Slot 236: Durable append acknowledgement

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the point at which an EventJournal append may truthfully report success to callers.

## Boundary
A successful acknowledgement means the configured durable storage contract was satisfied; it does not imply downstream delivery, projection refresh, or backup completion.

## Gate
Extend append semantics with explicit durable-ack behavior and typed storage failure. Keep persistence acknowledgement separate from domain event time.

## Falsification
Reject if buffered-but-uncommitted bytes are reported durable, outbound delivery is coupled to append success, retries can silently duplicate IDs, or acknowledgement time becomes occurred_at.

Implementation status: **not implemented in this PR**.
