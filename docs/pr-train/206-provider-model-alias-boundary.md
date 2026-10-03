# PR Train Slot 206: Provider model alias boundary

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent marketing names, API identifiers, deployment aliases, and user-facing labels without collapsing them into one unqualified model identity.

## Boundary
Aliases are scoped references to an identity, not identities themselves. Resolution remains provider-, region-, account-, and time-aware where evidence requires it.

## Gate
Reuse canonical identity/reference primitives. Record alias kind, scope, source, validity interval, and unresolved states; fail closed when an alias maps ambiguously.

## Falsification
Reject if a label becomes a canonical ID, one account's alias is universalized, ambiguous aliases resolve silently, or alias changes rewrite historical references.

Implementation status: **not implemented in this PR**.
