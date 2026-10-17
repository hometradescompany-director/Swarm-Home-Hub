# PR Train Slot 228: Deterministic rebuild baseline

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the baseline algorithm that derives residence projections from an ordered, validated event sequence starting from no local state.

## Boundary
Rebuild derives projections only; it does not emit new domain events or contact Atlas.

## Gate
Reuse existing projection reducers. Require identical validated input to produce structurally identical local projections and typed failure for invalid paths.

## Falsification
Reject if rebuild depends on wall-clock time, external services, mutable globals, prior snapshots, or nondeterministic iteration.

Implementation status: **not implemented in this PR**.
