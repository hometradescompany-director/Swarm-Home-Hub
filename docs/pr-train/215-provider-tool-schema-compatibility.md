# PR Train Slot 215: Provider tool-schema compatibility

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent which tool/function schema features a provider accepts without flattening provider-specific JSON/schema dialects into one fake universal contract.

## Boundary
Compatibility is scoped to schema features and provider versions; it does not prove runtime behavior for every tool invocation.

## Gate
Reuse capability and structured-output primitives. Record supported schema keywords, restrictions, version scope, source, and observed deviations.

## Falsification
Reject if partial schema support becomes full JSON Schema support, undocumented behavior becomes contractual, or provider coercion is mistaken for validation.

Implementation status: **not implemented in this PR**.
