# Copilot housekeeping ledger — 2026-10-14

This is an evidence snapshot, not merge authority.  It records the state
observed on 2026-10-14 and deliberately does not close, merge, deploy, change
permissions, or promote an authority boundary.

## Scope and evidence limits

The participating public repositories evidenced by the current issue material
are:

1. [Swarm Home Hub](https://github.com/hometradescompany-director/Swarm-Home-Hub),
   the canonical public Hub repository;
2. [Hub Tech Codex](https://github.com/hometradescompany-director/Hub-Tech-Codex),
   named as the independent prototype boundary in [#426](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/426);
3. [The Commons Pub (at least provisionally)](https://github.com/hometradescompany-director/The-Commons-Pub-at-least-provisionally.),
   the public Pub repository corresponding to the Pub runtime follow-up in
   [#428](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/428).

No public repository named “Atlas” is identified by the inspected Swarm
sources or issue links.  Atlas is an authority boundary in this repository;
its repository location and private task history therefore remain unverified.
Likewise, no tracked `System32`, `housekeeping`, or skill entrypoint was found.
The existing reusable Hub materials are
[`docs/PRIVATE_VERIFICATION_RELAY.md`](PRIVATE_VERIFICATION_RELAY.md) and
[`.github/workflows/private-verification-relay.yml`](../.github/workflows/private-verification-relay.yml);
they define the provenance and bounded-verification workflow used below.

GitHub does not reveal whether repository secrets exist.  This ledger reports
their configuration state as **not observable**, never as absent.
The accessible Copilot session store returned no Swarm Home Hub histories, so
session assignment/history is **unavailable to this audit** and any such work
is ready for owner delegation.

Canonical `main` was
[`fa177f97fd0c7c79080ee3b3e0fd1f89a6c56d61`](https://github.com/hometradescompany-director/Swarm-Home-Hub/commit/fa177f97fd0c7c79080ee3b3e0fd1f89a6c56d61)
at inspection.  A closed issue or merged PR is not treated as integration
unless its target was `main` and the commit is evidenced there.

## Triage ledger

| Work | Classification and state | Evidence | Blocker | Next action |
| --- | --- | --- | --- | --- |
| [#152](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/152), [#156](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/156), [#161–#166](https://github.com/hometradescompany-director/Swarm-Home-Hub/pulls?q=is%3Apr+is%3Aopen+161+162+163+164+165+166), [#169](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/169) | **Stale / documentation-only / open.** Each lead expressly says no runtime implementation is claimed; all date from 2026-09-20 and have no linked closing PR. | Open PR metadata; Atlas contract-slice descriptions. | No current review, CI, or integration evidence; their shared base was not established by the lead records. | Owner: retain only if a specific Atlas contract consumer is named; otherwise close or supersede the batch together after preserving the contract references. |
| [#419](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/419) / [#420](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/420) | **Partially implemented / awaiting decision.** #420 is draft, targets `main` at `5cf7…`, and carries `a2f55ef…`; owner approval exists. | Lifecycle mapping PR has an approved review. Its recorded CI failure was the then-unpatched `source-map-js` audit, not a lifecycle failure. | Stale base and failed historical check; no current mergeability evidence. | Owner: either refresh/re-run #420 for review, or supersede it with the smaller order-667 contract work; do not run a duplicate lifecycle agent. |
| [#424](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/424) | **Superseded / completed integration.** It targets #420 rather than `main`, but its dependency objective is now on canonical `main`. | #424 head `510ca02…` has passing `check` and `smoke`; [#484](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/484) merged `source-map-js@1.2.2` into `main` at `d9427f3…` with passing `check`, `bun`, and `smoke`. | The open PR itself remains chained to stale #420. | Owner: close #424 as superseded by #484; do not merge the stale chain. |
| [#426](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/426) / [#427](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/427) | **Partially implemented / unintegrated / awaiting review.** #427 is open at `95ab03d…`, targets old `main` `5cf7…`, and has an owner comment review. | The branch has UTC regressions and parser changes, but canonical `src/integrations/atlas/work-handoff.ts` still calls permissive `Date.parse`; its implementation is therefore not on `main`. The branch `bun` and `smoke` checks passed; its recorded `check` failure was the previous audit advisory. | Stale base and no current passing aggregate check after the audit fix. | Owner: refresh #427 onto current `main`, rerun checks, then review/merge as the single timestamp hardening path. |
| [#428](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/428) | **Blocked / draft / documentation-only.** It is an unmerged draft at `72742a6…`, based on `5cf7…`. | PR states the real Witness APK/backend and Pub runtime must be identified; its historical check failed only at the old dependency audit. | External runtime identity is unresolved and base is stale. | Owner: decide whether to retain the proposed contract; delegate runtime discovery to the Pub/Hub-Tech boundary before any implementation. |
| [#429](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/429) | **Awaiting review / stale CI.** Unmerged documentation PR at `c30986a…`, based on `5cf7…`. | Its sole historical check failed at the old `source-map-js` audit; no review is recorded. | Current CI has not been rerun and it has no approval. | Owner: refresh and rerun checks, then accept, revise, or close as a doctrine decision; it must not be treated as runtime authority. |
| [#435](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/435) | **Duplicate-adjacent / draft / documentation-only.** | It explicitly says no runtime lifecycle capability is implemented and overlaps #419/#420’s mapping purpose. | Old base, failed historical audit, and overlapping scope. | Owner: choose **one** of #420 or #435 as the lifecycle document owner before further work. |
| [#484](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/484) and [#486](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/486) | **Integrated.** | Both are merged; #484 targets `main`, and `main` contains the patched lock resolution. Their successful checks follow the earlier audit failures. | None for the advisory remediation. | Do not duplicate audit-fix work. |
| [#430](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/430) / [#499](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/499) | **In progress / awaiting review.** | #499 is a draft on this branch (`6b9df983…`) against `main` `fa177f…`; Copilot checks were still in progress at inspection. | Ledger review and owner decisions are pending. | Review this ledger; keep #430 open until the owner has made the queued decisions. |

## Private verification relay

The relay is already bounded to `workflow_dispatch` and owner-only
`/verify-private` comments on [control issue #345](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/345).
It accepts only a slot and exact 40-character SHA, uses fixed verifier profiles,
and publishes only a non-source receipt.

| Question | Finding and evidence |
| --- | --- |
| Are relay secrets configured? | **Not observable.** The workflow requires `PRIVATE_REPO_READ_TOKEN` and `PRIVATE_VERIFY_TARGETS_JSON` for slots `r1`–`r7`; GitHub’s repository/Actions metadata intentionally does not disclose secret presence or values. The `selftest` slot needs neither. |
| Has a selftest succeeded? | **Yes.** [Run 35651360154](https://github.com/hometradescompany-director/Swarm-Home-Hub/actions/runs/35651360154), initiated from #345, succeeded for exact SHA `ba7f050e8987c799f1585d6c347c944794032c53`. Its bounded-verification job and receipt-publication step both succeeded on an ephemeral `ubuntu-latest` runner. |
| Is the receipt still retrievable? | **No retained artifact was listed.** The workflow’s seven-day retention explains why this does not invalidate the successful runner/job receipt. |
| What is the fallback? | The smallest concrete change is an owner-approved `repository_dispatch` trigger in this relay, plus a scoped dispatcher credential in each approved source repository. It would send only `{target_slot, target_sha}` when a private check is unavailable. The owner must first approve the source repositories/slots and credential scope. |
| Why not add keepalive? | It would spend hosted-runner minutes, occupies concurrency, and conflicts with the existing ephemeral, exact-SHA model. The existing 30-minute job bound remains appropriate. |

The existing workflow does not accept `repository_dispatch`; therefore the
recommended fallback requires an owner-approved, bounded follow-up that adds a
new event trigger, validates a fixed event type and exact SHA/allowed slot, and
uses `concurrency` to serialize duplicate `(slot, SHA)` requests.  It should
publish status/receipt links and let GitHub queue/retry normally.  It must not
accept commands, branches, repository names, source, logs, or keepalive jobs.

**Cost and limit:** one ephemeral public runner invocation per request (up to
the workflow’s 30-minute timeout), subject to GitHub Actions minutes, queue
time, artifact retention, and concurrency.  It does not make private runners
available, transfer authority, or constitute a merge decision.

## Owner decision queue and bounded follow-ups

1. Select one lifecycle document owner: #420 **or** #435.
2. Approve refresh-and-rerun of #427 as the only timestamp-hardening path.
3. Close #424 as superseded by #484; retain #484/#486 as the audit-fix
   provenance.
4. Decide whether #428 and #429 remain review candidates; do not delegate
   runtime work until the external systems are identified.
5. Confirm the three public repository participation list above, and provide
   the Atlas repository reference only if it is intended to enter this audit.
6. Approve or decline the bounded `repository_dispatch` relay follow-up.  If
   approved, delegate separately to add the trigger and tests; the owner
   configures dispatcher credentials and secrets out of band.

These follow-ups are independent except that #420/#435 must be decided before
another lifecycle agent starts.  No session history assignment, merge, closure,
secret change, deployment, billing change, or authority promotion was performed.
