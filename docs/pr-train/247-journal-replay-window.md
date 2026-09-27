# PR Train Slot 247: Bounded replay window semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define safe replay from a selected journal position for rebuilding derived projections or delivery state without replaying unrelated domain commands.

## Boundary
Replay consumes persisted events; it must not recreate original command-side external effects.

## Gate
Require explicit start/end refs, consumer identity/version, idempotent projection semantics, and typed gap detection.

## Falsification
Reject if replay calls Atlas as though events are new commands, start position is guessed, duplicate consumption changes projections, or missing ranges are skipped.

Implementation status: **not implemented in this PR**.
