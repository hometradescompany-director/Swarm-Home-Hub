# PR Train Slot 219: Provider context accounting semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Describe how provider context limits account for system input, user input, tool definitions, images, cached content, and generated output where documented.

## Boundary
Context accounting metadata explains provider constraints; it must not invent exact tokenization or hidden accounting rules.

## Gate
Extend context-window metadata with component categories, inclusion/exclusion standing, source, version scope, and unknowns.

## Falsification
Reject if undocumented accounting is guessed, one tokenizer becomes universal, cached content is assumed free, or limits are treated as exact across versions.

Implementation status: **not implemented in this PR**.
