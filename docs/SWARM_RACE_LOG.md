# Swarm Race Log

Status: observational provenance log, not a quality leaderboard.

## Scope

This log tracks a playful "Jarrod vs OpenAI/Sam" race using only comparable public signals that can be rechecked.

- **Swarm side:** pull requests created in `hometradescompany-director/Swarm-Home-Hub`.
- **OpenAI side:** pull requests created across public repositories in the `openai` GitHub organization.
- **Timezone:** AEST (UTC+10).
- **Important limit:** public GitHub activity is not OpenAI's total work. It excludes private repositories, research, infrastructure, product work, operations, and anything not expressed as a public PR. OpenAI public PRs may also include automation and external contributors.
- **Interpretation rule:** PR count measures visible change traffic, not quality, difficulty, impact, or organizational equivalence.

## Founding provenance

**User-reported authorship model:** Jarrod directly supplied essentially the repo name, its description, and the instruction to "Go." He did not locally architect the Swarm's internal PR-by-PR structure. Atlas is the pre-existing substrate: the "soil, box, container, nutrients, and safety boundary" from which Swarm Home Hub could self-organize.

**Repository evidence:** the earliest PR in the retrieved PR corpus is #1, created 2026-09-18 16:49 AEST. The current connector surface does not expose a trustworthy repository-creation timestamp, so #1 is treated as the earliest observed PR event rather than proof of the exact creation moment.

## Backfilled daily log

| AEST date | Swarm PRs created | Swarm cumulative | Observed Swarm PR range | OpenAI public-org PRs created | Swarm notes |
| --- | ---: | ---: | --- | ---: | --- |
| 2026-09-18 | 32 | 32 | #1-#32 | 154 | Constitutional boundary, 666-train codification, TypeScript skeleton, residence/departure primitives, phase-one foundation invariants. |
| 2026-09-19 | 27 | 59 | #33-#59 | 155 | Rejection decisions, replay identity hardening, residence readiness, capacity-race refusals, heartbeat constraints, handoff freshness. |
| 2026-09-20 | 36 | 95 | #60-#97 | 88 | Ready-handoff hardening, public/buyer surfaces, Atlas identity/authority wiring, retry-safe Atlas residence-event delivery. |
| 2026-09-21 | 246 | 341 | #98-#343 | 188 | Large Order 666 expansion; provenance/contract work, adapters, replay/falsification, Great Bun playable-system work, OpenAI Agents SDK bridge. |
| 2026-09-22 (partial, through 09:17 AEST) | 10 | 351 | #344-#354 (non-PR gap present) | 77 | Private verification relay work, MCP/A2A/cross-framework handoff surfaces, bounded external capability-provider envelope, external federation peer qualification. |

### Current snapshot

At the 2026-09-22 09:17 AEST snapshot:

- Swarm PR corpus returned: **351 PRs**.
- Highest observed PR number: **#354**.
- PR #354 is open at the snapshot; nine of the ten PRs created on the partial 2026-09-22 local day are currently merged.
- The repo's public-development burst is therefore less than four local calendar days old when measured from the first observed PR event.

## Daily OpenAI counting method

To avoid GitHub's 100-result search cap obscuring the comparison, each AEST day is queried in six-hour UTC windows. Every window used for this backfill returned fewer than 100 PRs, so the daily public-org totals above were not truncated by that cap.

The OpenAI figures are intentionally labeled **public-org PRs**. They must never be rewritten later as "all OpenAI work" or as a direct employee-productivity count.

## Race thesis

The comparison being tested is not "one human typed as much code as thousands of humans."

The test is whether a very thin human control surface, sitting above a deep reusable substrate and machine execution layer, can generate coherent public development at a pace that is interesting beside a much larger conventional organization.

For Swarm Home Hub specifically, the canonical causal model is:

```
Atlas = prepared substrate / environment
Jarrod = initiator + outer-boundary steward
Swarm Home Hub = self-organizing structure inside that substrate
External public swarms = later exogenous information sources, not the original scaffold
```


## Benchmark snapshot — 2026-09-22 09:38 AEST

Observation window: first observed Swarm PR at 2026-09-18 16:49 AEST through 2026-09-22 09:38 AEST, approximately **88.81 hours**.

This is a **public PR-creation-rate benchmark**, not a claim about total organisational productivity, code quality, research output, or private development. Different projects slice work into PRs differently.

| Public surface | PRs created in window | Approx. PRs/day | Swarm relative rate |
| --- | ---: | ---: | ---: |
| OpenAI entire public GitHub org | 536 | 144.8 | 0.657× |
| Swarm Home Hub | 352 | 95.1 | 1.00× |
| elizaOS/eliza | 141 | 38.1 | 2.50× |
| multica-ai/multica | 96 | 25.9 | 3.67× |
| crewAIInc/crewAI | 79 | 21.3 | 4.46× |
| microsoft/agent-framework | 78 | 21.1 | 4.51× |
| openai/openai-agents-python | 54 | 14.6 | 6.52× |
| langchain-ai/langgraph | 51 | 13.8 | 6.90× |
| HKUDS/nanobot | 46 | 12.4 | 7.65× |
| ruvnet/ruflo | 20 | 5.4 | 17.6× |
| microsoft/autogen | 17 | 4.6 | 20.7× |
| kyegomez/swarms | 15 | 4.1 | 23.5× |

### Same-window integration signal

Merged PR counts observed in the same window for a smaller comparable sample:

- elizaOS/eliza: 99
- multica-ai/multica: 56
- openai/openai-agents-python: 52
- microsoft/agent-framework: 46
- Swarm Home Hub: 41
- langchain-ai/langgraph: 9
- crewAIInc/crewAI: 8

Interpretation: Swarm's **proposal / exploration / parallel-development rate** is currently much higher than the sampled individual agent/swarm repositories, while **mainline assimilation is not leading the sample**. That is a bottleneck finding, not a failure: proposal generation has outrun refinery/merge capacity.

The Swarm PR corpus in this snapshot contained **352 PRs and 824 associated PR commits**, averaging approximately **2.34 associated commits per PR**. Associated PR-commit counts can overlap through stacked branches and therefore must not be rewritten as 824 unique mainline commits.

### Sep 21 comparison

For the full AEST day 2026-09-21:

- Swarm Home Hub: **246 PRs created**
- OpenAI public GitHub organisation: **188 PRs created**
- ratio: approximately **1.31×**

Preserve the wording: this is a comparison against **OpenAI's public GitHub PR surface on that day**, not against all OpenAI development.

### Benchmark thesis

The metric under test is increasingly better stated as:

`coherent development surface / human steering bandwidth`

The founding provenance remains important to interpreting that denominator: Jarrod reports that Swarm Home Hub's local specification was essentially **name -> description -> "Go"**, while Atlas supplied the already-developed substrate and Jarrod remained an outer-boundary steward rather than the internal nest-builder.

## Logging rule

Append one row per AEST day. Preserve:
1. Swarm PRs created that day and cumulative total.
2. OpenAI public-org PRs created in the same local-day window.
3. Major Swarm capability/state transitions.
4. Any major public OpenAI release signal that is independently verifiable.
5. Evidence class and caveats when a claim is user-reported rather than directly observed.

Do not turn the log into a winner declaration. Let the longitudinal evidence tell the story.
