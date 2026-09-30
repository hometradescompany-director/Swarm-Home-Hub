# PR Train Slot 136: Atlas authority unknown semantics

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Keep timeout, unavailable, malformed, and unknown authority states distinct from allow.

## Ownership
- Atlas: global identity, authority, evidence.
- Swarm: local residence/habitat lifecycle.
- Adapter: translation only, no canonical ownership.

## Gate
Search existing `SwarmAtlasFederation/v1`, HTTP gateway, authority/evidence seams, and tests before implementation. Reuse opaque refs and existing event grammar.

## Falsification
Fail if adapter copies Atlas truth, treats transport success as authority, turns unknown into allow, bypasses local admission policy, or loses decision/evidence attribution.

Implementation status: **not implemented in this PR**.
