# Atlas work federation

The Swarm HTTP boundary exposes an additive Atlas work handoff at
`POST /swarm-home/events`.

## Configuration

Swarm authenticates Atlas federation with:

`SWARM_ATLAS_INGRESS_TOKEN`

Atlas supplies:

`SWARM_HANDOFF_URL` pointing at the Swarm events endpoint, and
`SWARM_HANDOFF_TOKEN` containing the same federation secret.

No federation secret belongs in source control, documentation, or CI.

## Contract

The ingress accepts an authenticated `atlas-event/v1` envelope whose
`name` is `atlas.work.requested` and whose `handoff_contract` is
`atlas-swarm-handoff/v1`.

Required fields:

- `event_id`: non-empty string and federation correlation identity.
- `occurred_at`: valid ISO-8601 timestamp.
- `subject_ref`: non-empty string.
- `source_sequence`: integer or null when present.
- `work_kind`: non-empty string.
- `parameters`: JSON object.

Unknown fields are non-authoritative. Authentication does not grant arbitrary
work execution authority. The injected Swarm work handler remains responsible
for domain admission and policy.

## Responses

- `401`: missing or invalid Bearer authentication.
- `503` with `federation_not_configured`: server credential is absent.
- `415`: content type is not JSON.
- `413`: body exceeds the transport limit.
- `400`: malformed JSON or invalid/unsupported envelope.
- `202`: handler accepted or deliberately refused a valid request.
- `500`: unexpected handler failure.

Accepted and refused outcomes both preserve the incoming `event_id` as
`correlation_id`.

The existing `/swarm-home/tools/*` transport and `SWARM_PLAY_TOKEN`
playable authentication remain separate.

## Result return path

Swarm reports the outcome of a hand-off back to Atlas through Atlas's existing
Gateway event ingest (`POST /api/public/v1/events`, Bearer Atlas gateway
token). `AtlasWorkResultReporter` (`src/integrations/atlas/work-result.ts`)
sends an `atlas-event/v1` event named `swarm.work.result` whose
`payload.correlation_event_id` is the request `event_id` and whose
`payload.outcome` is `completed`, `refused` or `failed`. Its own `event_id` is
derived deterministically from the request id, so replays are idempotent.

Atlas grants the Swarm gateway client only `observe:event` narrowed to
`swarm.work.result`. A result is evidence, never a command.

## Not the peer handshake

`SwarmHomeFederation/v1` (`docs/FEDERATION_HANDSHAKE_V1.md`) is a separate
home-to-home peer recognition seam. It carries no Atlas work and grants no
Atlas authority. Atlas's canonical spec for this edge lives in the Atlas
repository at `docs/integration/atlas-swarm-handoff-v1.md`.

## Atlas control-plane face

The Atlas workspace also contains the administrative project **Swarm Hub Control**.
Its intended published endpoint is `https://swarm-hub-control.lovable.app`.

This project is a control-plane face, not a replacement for Atlas Gateway and not
an intermediary for work or result traffic. It is intended to hold tenant, Swarm
instance, credential-authority and audit metadata while the actual federation
edges remain:

- Atlas -> deployed Swarm: `POST /swarm-home/events` using `atlas-event/v1` and
  `atlas-swarm-handoff/v1`.
- Swarm -> Atlas: `POST /api/public/v1/events` using the existing
  `swarm.work.result` evidence path.

The control plane must never place federation secrets in source control. Swarm
ingress credentials remain scoped to their intended tenant/instance and are
installed through deployment secret storage.

The published Lovable URL is currently an administrative hosting seam. A live
Swarm deployment and explicit environment pairing are still required before it
represents a production end-to-end federation path.

For Issue #419 continuity reconciliation and deployment pairing/hardening steps,
see `docs/operations/SWARM_ATLAS_PAIRING.md`.
