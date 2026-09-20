# PR Train Slot 203: Provider offering source provenance

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Define a provenance envelope for provider/model offering facts so every capability, policy, price, availability, and compatibility claim retains its source, observation time, scope, and version.

## Boundary
Swarm may project provider facts, but it does not become the canonical source for externally owned provider truth. Derived summaries must remain traceable to source observations.

## Gate
Reuse existing provenance/evidence contracts where possible. Preserve source identity, observed_at, effective scope, version, retrieval method, and typed absence before any adapter is marked implemented.

## Falsification
Reject if provider facts lose source attribution, summaries overwrite observations, observation time is confused with effective time, or missing evidence is silently promoted to fact.

Implementation status: **not implemented in this PR**.
