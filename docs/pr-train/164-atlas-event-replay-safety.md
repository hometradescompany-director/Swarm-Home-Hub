# PR Train Slot 164: Atlas event replay safety

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Specify how replayed Swarm events retain stable identity and avoid duplicate Atlas effects.

## Boundary
Swarm event identity remains authoritative for residence transitions. Atlas delivery state is evidence about transport/federation, not a duplicate event source.

## Gate
Search delivery ledger, event sink, federation gateway, health/telemetry code, and tests before implementation. Preserve opaque references and idempotent replay.

## Falsification
Reject if acknowledgement becomes canonical truth, rejection deletes history, uncertain delivery is flattened, replay duplicates effects, or observability leaks sensitive data.

Implementation status: **not implemented in this PR**.
