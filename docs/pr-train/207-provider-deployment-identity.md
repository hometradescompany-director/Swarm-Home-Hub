# PR Train Slot 207: Provider deployment identity

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent provider deployment, endpoint, region-specific deployment, and model identity as separate references so an endpoint can move without rewriting model history.

## Boundary
A deployment is an addressable provider surface, not the model itself and not an authority grant.

## Gate
Reuse provider/model identity and region primitives. Record provider scope, deployment reference, model reference, observed endpoint metadata, and evidence attribution.

## Falsification
Reject if endpoint URL becomes canonical model identity, deployment movement rewrites history, regional deployment implies global availability, or credentials are persisted as metadata.

Implementation status: **not implemented in this PR**.
