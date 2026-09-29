# PR Train Slot 280: Admission re-evaluation semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define how a requested residence may be evaluated again after evidence, authority, capacity, or policy changes.

## Boundary
Re-evaluation is a new decision event/context, not mutation of the previous decision record.

## Gate
Reference prior evaluation/decision receipt, new evidence set, current policy version, capacity observation, and resulting transition or refusal.

## Falsification
Reject if prior decision is overwritten, stale evidence is reused silently, re-evaluation skips current capacity, or repeated checks create duplicate admissions.

Implementation status: **not implemented in this PR**.
