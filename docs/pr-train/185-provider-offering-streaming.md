# PR Train Slot 185: Provider streaming capability projection

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent streaming support and constraints as provider-declared, versioned metadata.

## Boundary
This is an attributable capability projection only. Provider metadata never grants residence authority or becomes a permanent truth about a model family.

## Gate
Search existing provider/offering seams first. Preserve exact provider/model/version identity, directional capability distinctions, and typed unknown/unsupported states.

## Falsification
Reject if capabilities are inferred without evidence, input/output directions collapse, version changes are ignored, or missing metadata is treated as supported.

Implementation status: **not implemented in this PR**.
