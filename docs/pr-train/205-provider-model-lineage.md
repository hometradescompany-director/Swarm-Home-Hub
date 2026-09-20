# PR Train Slot 205: Provider model lineage relationship

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Define explicit predecessor, successor, family, and replacement relationships between provider model offerings while keeping identity and capability claims separately attributable.

## Boundary
Lineage relationships describe provider/model topology; they do not imply equivalence, superiority, compatibility, or migration permission.

## Gate
Search existing identity and replacement contracts before adding new types. Require opaque model references, scoped relationship kinds, source evidence, and versioned observations.

## Falsification
Reject if lineage collapses distinct model identities, successor implies drop-in replacement, family membership implies shared capability, or relationships are inferred without evidence.

Implementation status: **not implemented in this PR**.
