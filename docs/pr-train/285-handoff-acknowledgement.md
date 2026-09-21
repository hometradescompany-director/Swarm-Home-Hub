# PR Train Slot 285: Handoff acknowledgement contract

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 284 · Handoff consumption boundary**
- Merge after: **284**
- Supersedes: **none**
- Proves: acknowledgement cannot manufacture authority, identity ownership, or state acceptance.
- Resulting state: handoff consumption has an explicit, auditable acknowledgement boundary.

## Intent
Define the acknowledgement returned after a destination inspects a handoff capsule.

## Ownership
- Owns: acknowledgement semantics and refusal reasons.
- Knows: destination validation result, capsule freshness, and opaque evidence references.
- Emits: acknowledgement or typed refusal events.
- Maintains: relationship from acknowledgement to the consumed capsule and destination decision.

## Boundary
Acknowledgement confirms receipt and evaluation only. It does not certify admission, transfer authority, mutate source truth, or convert copied references into canonical state.

## Gate
Require destination-local validation, current readiness, capsule freshness, and a typed outcome before acknowledgement is emitted.

## Falsification
Reject the contract if acknowledgement can be interpreted as admission, stale capsules can be acknowledged as current, or receipt silently mutates authority.

Implementation status: **not implemented in this PR**.
