# PR Train Slot 256: Rebuild divergence bisection

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define a deterministic method to locate the earliest event or projection step where two rebuild executions diverge.

## Boundary
Bisection is a diagnostic over derived behavior, not permission to remove the triggering historical event.

## Gate
Require identical input range, deterministic checkpoints, projection-version identities, and reproducible comparison output.

## Falsification
Reject if the tool mutates input, skips nondeterministic steps, blames the first differing field without event context, or masks divergence by normalization.

Implementation status: **not implemented in this PR**.
