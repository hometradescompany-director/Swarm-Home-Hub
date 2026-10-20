# PR Train Slot 312: Capacity claim conflict detection

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 311**
- Merge after: **311**
- Supersedes: **none**
- Proves: conflicts are surfaced as contradictions rather than resolved by silent last-write-wins behavior.
- Resulting state: define detection of incompatible simultaneous claims over the same bounded capacity.

## Intent
Define detection of incompatible simultaneous claims over the same bounded capacity.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
conflicts are surfaced as contradictions rather than resolved by silent last-write-wins behavior.

## Gate
Require claim identities, capacity source, overlapping bounds, and contradiction evidence.

## Falsification
Reject the contract if one claim silently overwrites another, conflicts vanish from history, or detection invents a winner.

Implementation status: **not implemented in this PR**.
