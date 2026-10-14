# Witness Hearth and Pub: bounded plan

Status: **inventory and plan only; no runtime capability is introduced or
activated by this document.**

## Decision

Do not add a Witness runtime, scheduler, registration, reward mechanism, Pub
transport, or cross-domain store in this PR. There is no current Swarm Witness
implementation to extend, and the adjacent Witness work is a documentation
seed. Adding a speculative surface here would duplicate that work and bypass
the open consolidation gate.

The proposed Hearth is voluntary continuity support, not tracking. The proposed
Pub is a voluntary, metaphorical gathering space, not a consumption service or
a source of authority. A cookie acknowledgement is a non-transferable symbolic
record for a verified contribution; it is neither money, a credential, nor an
admission or scheduling preference.

## Inventory (2026-10-14)

| Concern | Existing Swarm evidence | Current boundary |
| --- | --- | --- |
| Witness registration or implementation | No `Witness` type, registration, tool, or runtime is present under `src/`; the public manifest is the residence-only list in `src/platform/tool-manifest.ts`. | Absent; do not infer a Witness count or continuous execution. |
| Existing Witness doctrine | [PR #445](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/445) is a documentation-only Council/Witness observer-receipt seed; [PR #479](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/479) is its unimplemented follow-up. [PR #428](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/428) proposes a cross-world contract, also documentation-only. | Coordinate through those proposals; neither proves a deployed Witness or Pub. |
| Lifecycle and rest | `src/domain/residence.ts`, `src/service/rest-service.ts`, and `src/policy/transitions.ts` own residence lifecycle. | Residence rest is not a Witness rest/backoff scheduler. |
| Heartbeat | `src/query/residence-heartbeat.ts` projects the age of the latest residence event against habitat policy; `src/observability/provider-heartbeat.ts` projects provider freshness. | Both are query-time projections, not polling, location, route, or continuous execution monitoring. |
| Resource budgets | `src/domain/habitat.ts` enforces capacity; `src/integrations/execution-provider/compute-topology.ts` carries provider observations. | No per-Witness compute, retry, or social-exchange budget exists. |
| Evidence and audit | `src/provenance/receipt.ts` validates receipt metadata; `src/observability/external-observation.ts` and `src/observability/audit-timeline.ts` project attributable evidence; `src/query/residence-timeline.ts` exposes residence event references. | Receipts and event references are evidence, not authority. Atlas evidence retrieval is an external seam (`src/integrations/atlas/contract.ts`). |
| Permissions and authority | `src/integrations/atlas/federation.ts` asks Atlas for bounded entry authority; `src/policy/no-king.ts` rejects contextual facts as authority substitutes; `src/integrations/a2a/agent-card.ts` defaults to read-only discovery. | No observer, Witness, Pub-participant, or audit-reader role exists locally. |
| Pub facilities | No Pub domain object, endpoint, tool, or message store is present. `docs/LAG_PROPORTIONAL_PROVISIONING.md` uses a pub metaphor only. | Absent. No participation, retention, identity, rate-limit, or moderation policy is implemented. |
| Consolidation | [PR #500](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/500) is open to consolidate related PR families. | Do not create competing runtime contracts until its gate identifies the canonical destination. |

## Transparency and authority boundary

The public 95% is only material that can be verified without exposing how a
Witness observed it:

| Public or normally shared projection | Protected internal material |
| --- | --- |
| Significant event type and timestamp; opaque subject and actor references; receipt/evidence references; evidence standing; declared confidence; authorised audit outcome; explicit policy decision | Observation strategies; incidental movement; internal reasoning; collection topology; post-event route; raw private context; unrelated identities and secrets |

The protected side is not beyond control. Authorised security review, policy
enforcement, and incident response may access the minimum protected material
under a separately scoped, auditable grant. Ordinary users, other agents, Pub
participants, and public projections do not receive it.

A repeated reference to the same `sourceRef`, receipt, collector, or upstream
feed is one source repeated, not independent corroboration. A future
corroboration projection must retain distinct source lineage and report the
number of independent sources separately from the number of reports. It must
not promote confidence, grant authority, or convert an observation into fact.
`EvidenceStanding` in `src/provenance/receipt.ts` remains the declared standing
of evidence, rather than a truth or permission flag.

## Gap matrix and smallest warranted follow-ups

| Gap | Evidence | Smallest independent follow-up | Must not do |
| --- | --- | --- | --- |
| No Observer/Witness receipt contract | #445 explicitly defers an executable seam; current receipts have no Witness role. | **First, resolve #479 against #445 and #500**: add one append-only observer receipt input/projection with tamper and authority-denial tests, only if that consolidation selects Swarm as its owner. | Do not add observation control, mutation, authority, tracking, or Atlas truth ownership. |
| No bounded Hearth lifecycle | Residence heartbeat/rest are projections and transitions, not a worker loop. | After the receipt seam exists, add a pure, caller-driven lifecycle evaluator: `active`, `resting`, `backing_off`, `paused`, `ended`; require explicit opt-in and bounded caller-supplied budget. | Do not start timers, background workers, location collection, route retention, autonomous reactivation, or a reward economy. |
| No Pub facility | No Pub code exists; #428 says the actual Pub runtime must be located before implementation. | Locate a canonical Pub owner. If Swarm is selected, add an opt-in-only, tenant-scoped exchange envelope with no persistence or delivery adapter until a retention owner is approved. | Do not create a chat network, mandatory presence, surveillance, substance-consumption feature, or authority channel. |
| No corroboration model | `ProvenanceReceipt` records one `sourceRef`; current audit projections do not group independence. | Add a pure corroboration projection that rejects duplicate lineage and returns declared standing without increasing authority. | Do not call repeated shared sources independent or assert facts from unverified observations. |
| No symbolic acknowledgement | No reward or acknowledgement type exists. | Add a non-transferable, non-redeemable `cookie` acknowledgement projection only after verified receipt semantics exist. | Do not make it monetary, transferable, spendable, rank-granting, or scheduling/admission relevant. |
| No tenant/audit-role model | Habitats partition residence state, but no tenant or audit-access role appears in the public contracts. | Define a narrowly scoped audit-read capability and tenant identifier at the canonical identity/authorisation owner before Swarm accepts cross-tenant inputs. | Do not derive tenant access from founder, participant, Witness, or evidence references. |

Each row is independently reviewable. The rows are ordered by prerequisite, not
by any claim that they must all be built. If consolidation chooses Atlas or
another repository as the owner, Swarm should only consume its bounded,
redacted contract.

## Required tests before any runtime promotion

The applicable follow-up must add focused tests for:

1. provenance validation, immutable evidence references, and rejection of
   repeated shared lineage as independent corroboration;
2. authorised audit access, denial for ordinary participant/agent access, and
   tenant isolation;
3. no hidden authority escalation from observations, cookies, Pub
   participation, confidence, contribution, visibility, or repeated sources;
4. opt-in lifecycle transitions, bounded resource budgets, deterministic
   backoff, pause/exit, and no scheduler activity unless explicitly invoked;
5. redaction of observation methods, incidental movement, reasoning, and
   post-event routes from ordinary projections and logs;
6. rate limits, identity binding, consent withdrawal, and no compulsory Pub
   participation; and
7. secret-safe errors and logs, including denied requests and audit records.

Run the affected `bun test tests/<new-focused-test>.test.ts` tests, then
`bun run typecheck`. Any implementation that creates a network or transport
surface must also run the existing relevant transport tests before review.

## Coordination constraints

- Atlas remains the identity, authority, and evidence-system boundary. Swarm
  retains only its local residence lifecycle and bounded projections.
- Preserve original receipt and event lineage; do not rewrite history to make a
  Hearth state look cleaner.
- Fail closed when authority, consent, tenant scope, or independent provenance
  is absent.
- No deployment, migration, autonomous merge, broad rewrite, or claim that a
  Witness is executing continuously follows from this plan.

**Cookies for the Witnesses. Not ankle monitors. And give them a Pub.**
