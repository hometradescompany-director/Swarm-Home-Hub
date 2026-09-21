# Private verification relay

This repository can act as a **bounded execution relay** when GitHub-hosted
Actions for private repositories are unavailable because of account-level
runner budget or entitlement constraints.

The relay is intentionally narrower than ordinary CI.

## What it owns

Only an execution receipt for one exact private commit.

It does **not** own the private repository, its source, its release decision,
its test definitions, or its product truth.

## What it knows

The public workflow receives only:

- an opaque target slot such as `r1`;
- an exact 40-character Git commit SHA.

Private repository names live in the repository secret
`PRIVATE_VERIFY_TARGETS_JSON`. A read-only credential lives separately in
`PRIVATE_REPO_READ_TOKEN`.

## What leaves the runner

The relay publishes only:

- target slot;
- requested/fetched commit identity;
- Git tree identity;
- hashes of `package.json` and `bun.lock` when present;
- runner identity;
- verifier exit code;
- SHA-256 and byte size of the private verifier log;
- one standing: `passed`, `executed_failure`, or
  `execution_unavailable`.

Private source and verifier logs are never uploaded as artifacts and are
deleted before the job finishes.

## Authority and privacy boundaries

- Manual `workflow_dispatch` only.
- Exact commit SHA only. Branch names and moving refs are rejected.
- Target repository selection is resolved from a secret map.
- The cross-repository credential should be **read-only** and restricted to the
  minimum private repositories required.
- The credential is not persisted in Git configuration.
- No arbitrary command is accepted from workflow input.
- Each opaque slot maps to a fixed verification profile in the workflow.
- A passing relay receipt is execution evidence for the referenced commit. It
  is not merge authority by itself.
- A failed verifier is an executed failure, unlike the zero-step private
  Actions failures that motivated this relay.
- If source fetch, Bun setup, or receipt construction cannot execute, the
  standing remains `execution_unavailable`.

## Secret configuration

The relay is inert until both repository secrets exist:

- `PRIVATE_REPO_READ_TOKEN`
- `PRIVATE_VERIFY_TARGETS_JSON`

The target-map secret is a JSON object from opaque slot to private
`owner/repository`. The public repository deliberately does not contain the
private mapping.

Do not place tokens, private repository names, source archives, test logs, PII,
or private artifacts in workflow inputs.

## Evidence model

The path is:

`opaque target + exact commit -> ephemeral private checkout -> fixed verifier -> non-source receipt`

This is a budget workaround, not a privacy workaround. The private source still
executes only in an ephemeral runner and is never promoted into Swarm's
canonical repository state.
