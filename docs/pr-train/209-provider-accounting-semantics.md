# PR Train Slot 209: Provider accounting semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Describe provider-specific usage units and accounting semantics without pretending unlike token, character, image, audio, or compute measures are directly interchangeable.

## Boundary
Accounting metadata explains metering; it does not calculate billing truth or normalize unlike units into a fake universal token.

## Gate
Reuse pricing and usage observation primitives. Keep unit kind, direction, provider scope, measurement source, and effective interval explicit.

## Falsification
Reject if unlike units are collapsed, provider estimates become audited cost, output units are treated as input units, or historical accounting rules are overwritten.

Implementation status: **not implemented in this PR**.
