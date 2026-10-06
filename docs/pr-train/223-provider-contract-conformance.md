# PR Train Slot 223: Provider adapter contract conformance

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Define a bounded conformance checklist that each provider/model adapter must satisfy before it can be treated as usable by Swarm.

## Boundary
Conformance proves adherence to Swarm's adapter contract only; it does not certify provider quality, safety, legality, or business suitability.

## Gate
Reuse existing identity, provenance, capability, failure, temporal, and policy metadata contracts. Require explicit unknowns rather than fabricated completeness.

## Falsification
Reject if missing fields are silently defaulted, provider-specific semantics are erased, evidence is absent, or conformance is used as a provider endorsement.

Implementation status: **not implemented in this PR**.
