# One-command buyer proof

This repository includes a local proof harness for the public Swarm Home boundary.

It does not create a new source of truth, write customer data, or bypass admission policy. It only exercises the existing public transport and reports what happened.

## Run

```bash
npm ci
npm run proof
```

The command compiles the project, starts the bounded demo host locally, then verifies four observable properties:

1. the public transport is healthy;
2. tool discovery exposes the read-only inspection capability;
3. read-only inspection succeeds;
4. a state-mutating request fails closed with HTTP 403 when no admission guard is supplied.

The command prints a JSON report to stdout when all checks pass. A failed check prints a JSON failure report and exits non-zero.

## What this proves

It proves the checked behaviour of the local public demo boundary at the commit you ran.

It does **not** prove production deployment, customer integration, Atlas availability, external identity-provider behaviour, or unrestricted authority. Those require their own evidence and environment-specific evaluation.

## Why this exists

A technical buyer should be able to test the core boundary without trusting a slide deck or a founder's description. The proof is intentionally small enough to run locally and strict enough to fail when the public transport stops preserving its stated boundary.
