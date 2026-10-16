# PR Train Slot 213: Provider idempotency support

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Describe whether an offering supports idempotency keys or equivalent duplicate-suppression mechanisms for bounded operations.

## Boundary
Support metadata does not make an operation idempotent by itself; callers must still supply correct keys and respect provider scope.

## Gate
Reuse request identity and replay primitives. Preserve supported operations, key scope, retention window, source evidence, and unknown states.

## Falsification
Reject if support on one endpoint becomes universal, missing documentation becomes unsupported, key reuse safety is assumed, or transport retries are treated as semantically idempotent.

Implementation status: **not implemented in this PR**.
