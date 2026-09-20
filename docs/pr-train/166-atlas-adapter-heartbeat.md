# PR Train Slot 166: Atlas adapter heartbeat

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Specify liveness/readiness heartbeat semantics that do not imply authority availability.

## Boundary
Swarm event identity remains authoritative for residence transitions. Atlas delivery state is evidence about transport/federation, not a duplicate event source.

## Gate
Search delivery ledger, event sink, federation gateway, health/telemetry code, and tests before implementation. Preserve opaque references and idempotent replay.

## Falsification
Reject if acknowledgement becomes canonical truth, rejection deletes history, uncertain delivery is flattened, replay duplicates effects, or observability leaks sensitive data.

Implementation status: **not implemented in this PR**.
