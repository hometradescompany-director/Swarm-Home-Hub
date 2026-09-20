# PR Train Slot 221: Provider determinism controls

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent provider controls such as seed, temperature, top-p, and reproducibility hints without claiming deterministic generation where the provider does not.

## Boundary
Control availability is separate from reproducibility guarantees; identical parameters do not prove identical outputs.

## Gate
Extend offering parameter metadata. Record control names, ranges, defaults, interaction caveats, model/version scope, and evidence.

## Falsification
Reject if seed becomes deterministic guarantee, default values are guessed, parameter ranges are generalized across models, or sampling controls become quality rankings.

Implementation status: **not implemented in this PR**.
