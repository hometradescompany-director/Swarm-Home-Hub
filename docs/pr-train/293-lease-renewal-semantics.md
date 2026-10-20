# PR Train Slot 293: Lease renewal semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 292**
- Merge after: **292**
- Supersedes: **none**
- Proves: renewal preserves lineage and requires fresh authority rather than converting temporary access into permanence.
- Resulting state: define renewal as a new bounded decision linked to, but not silently extending, the prior lease.

## Intent
Define renewal as a new bounded decision linked to, but not silently extending, the prior lease.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
renewal preserves lineage and requires fresh authority rather than converting temporary access into permanence.

## Gate
Require prior lease identity, fresh grant and acceptance checks, revised bounds, and renewal event.

## Falsification
Reject the contract if expired leases auto-renew, scope grows silently, or prior consent is reused indefinitely.

Implementation status: **not implemented in this PR**.
