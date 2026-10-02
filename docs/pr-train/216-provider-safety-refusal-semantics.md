# PR Train Slot 216: Provider safety refusal semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent provider refusal and safety-block outcomes distinctly from transport errors, policy metadata, and user-level authorization failures.

## Boundary
A refusal is an observed provider response category, not a moral judgment, local policy decision, or permanent model property.

## Gate
Extend error/refusal taxonomy with source response references, provider scope, observation time, and opaque policy identifiers where available.

## Falsification
Reject if refusal becomes outage, local denial becomes provider refusal, one refusal becomes universal capability loss, or provider motive is inferred.

Implementation status: **not implemented in this PR**.
