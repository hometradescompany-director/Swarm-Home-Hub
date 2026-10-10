# PR Train Slot 190: Provider batch-processing capability

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent batch availability and constraints as external operational metadata.

## Boundary
This is an attributable capability projection only. Provider metadata never grants residence authority or becomes a permanent truth about a model family.

## Gate
Search existing provider/offering seams first. Preserve exact provider/model/version identity, directional capability distinctions, and typed unknown/unsupported states.

## Falsification
Reject if capabilities are inferred without evidence, input/output directions collapse, version changes are ignored, or missing metadata is treated as supported.

Implementation status: **not implemented in this PR**.
