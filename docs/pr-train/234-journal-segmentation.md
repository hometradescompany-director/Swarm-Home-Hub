# PR Train Slot 234: Journal segmentation semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Allow large journals to be physically segmented while keeping one logical append-only event history.

## Boundary
Segments are storage layout only; segment boundaries carry no domain meaning and cannot change causal ordering.

## Gate
Specify immutable segment identity, range metadata, digest chaining, predecessor continuity, and deterministic scan order.

## Falsification
Reject if segment rotation emits domain events, range gaps disappear silently, segment timestamps become causal order, or a missing segment is treated as empty history.

Implementation status: **not implemented in this PR**.
