# PR Train Slot 165: Atlas adapter observability

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Define inspectable adapter health/decision telemetry without logging PII or authority secrets.

## Boundary
Swarm event identity remains authoritative for residence transitions. Atlas delivery state is evidence about transport/federation, not a duplicate event source.

## Gate
Search delivery ledger, event sink, federation gateway, health/telemetry code, and tests before implementation. Preserve opaque references and idempotent replay.

## Falsification
Reject if acknowledgement becomes canonical truth, rejection deletes history, uncertain delivery is flattened, replay duplicates effects, or observability leaks sensitive data.

Implementation status: **not implemented in this PR**.
