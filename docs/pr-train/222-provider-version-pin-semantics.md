# PR Train Slot 222: Provider version pin semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent whether a caller can pin model/provider versions and what stability guarantees, if any, accompany the pin.

## Boundary
A version identifier is not a promise of immutable behavior unless the provider explicitly guarantees it.

## Gate
Reuse version, deprecation, and replacement primitives. Record pin kind, scope, mutability claim, deprecation relation, and source evidence.

## Falsification
Reject if alias equals immutable version, dated name implies stability, pin support implies indefinite availability, or replacement is treated as equivalent.

Implementation status: **not implemented in this PR**.
