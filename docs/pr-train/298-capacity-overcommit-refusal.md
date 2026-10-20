# PR Train Slot 298: Capacity overcommit refusal

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 297**
- Merge after: **297**
- Supersedes: **none**
- Proves: capacity limits remain explicit policy constraints rather than advisory metrics.
- Resulting state: define deterministic refusal when a requested reservation or admission would exceed bounded capacity.

## Intent
Define deterministic refusal when a requested reservation or admission would exceed bounded capacity.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
capacity limits remain explicit policy constraints rather than advisory metrics.

## Gate
Require current capacity projection, pending reservations, requested amount, and typed refusal evidence.

## Falsification
Reject the contract if overcommit is silently allowed, stale projection governs, or refusal lacks causal evidence.

Implementation status: **not implemented in this PR**.
