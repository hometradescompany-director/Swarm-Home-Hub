# PR Train Slot 260: Persistence backpressure contract

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define how storage adapters signal saturation or degraded write capacity without silently dropping or buffering unbounded domain events.

## Boundary
Backpressure governs acceptance timing, not domain semantics or authority.

## Gate
Specify bounded queue behavior if any, rejection/error semantics, retry guidance, durable-ack interaction, and operator observability.

## Falsification
Reject if events are silently dropped, memory buffering is unbounded, success is returned before durable policy is met, or backpressure mutates event timestamps.

Implementation status: **not implemented in this PR**.
