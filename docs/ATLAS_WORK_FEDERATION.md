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
