# Swarm Home Hub release policy

Status: operating policy, not a release.

A release may be cut from green `main` only after:
- typecheck and full tests pass;
- residence-phase contract passes;
- transport/tool-surface changes are documented;
- authority/provenance compatibility is preserved.

Use semantic version tags. Record source SHA, verification runs, public tool-surface changes, known limitations, and rollback target.

A merge is not automatically a release.
