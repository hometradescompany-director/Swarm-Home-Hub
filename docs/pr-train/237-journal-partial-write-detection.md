# PR Train Slot 237: Partial write detection

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define how persistence detects and reports torn, truncated, or otherwise incomplete durable event writes.

## Boundary
Detection marks storage evidence as unsafe; it must not synthesize or complete the missing event payload.

## Gate
Reuse integrity/corruption standing. Preserve storage reference, expected length/digest when known, detected fragment, observed_at, and recovery standing.

## Falsification
Reject if a fragment is parsed as a complete event, zero-fill becomes data, truncation is silently ignored, or later bytes retroactively rewrite the original detection event.

Implementation status: **not implemented in this PR**.
