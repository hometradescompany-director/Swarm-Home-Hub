# PR Train Slot 212: Provider timeout and cancellation semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Describe provider timeout, cancellation, disconnect, and abandoned-request semantics so callers can reason about uncertain completion without inventing success or failure.

## Boundary
Transport termination is not proof that provider-side work stopped; uncertain completion must remain explicit.

## Gate
Reuse event and typed-absence semantics. Record request reference, termination kind, provider acknowledgement when available, observation time, and uncertainty standing.

## Falsification
Reject if client timeout becomes provider cancellation, disconnect becomes failure, missing acknowledgement becomes success, or duplicate retry is assumed safe without idempotency evidence.

Implementation status: **not implemented in this PR**.
