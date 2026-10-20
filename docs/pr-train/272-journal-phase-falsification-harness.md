# PR Train Slot 272: Persistence/rebuild phase falsification harness

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the phase-level falsification proof for slots 225-272 covering durability, deterministic rebuild, corruption, concurrency, versioning, backup/restore, and failover.

## Boundary
This harness tests persistence invariants and evidence claims; it is not a substitute for production telemetry or independent external audit.

## Gate
Exercise clean rebuild, corrupted tail, stale writer, mixed schema, replica lag, restore, failover, checkpoint mismatch, and cross-adapter equivalence with typed outcomes.

## Falsification
Reject the phase if acknowledged events can disappear, history can be silently rewritten, rebuild is nondeterministic, gaps become absence, failover permits dual writers, or derived state becomes canonical.

Implementation status: **not implemented in this PR**.
