# Swarm ↔ Atlas pairing and hardening

This is the bounded implementation path for Issue #419 continuity reconciliation.

## Lifecycle continuity map

Current runtime path:

1. external agent identity enters Swarm request boundary;
2. Swarm asks Atlas for opaque identity mapping and `swarm.residence.enter` authority;
3. Swarm applies local habitat/capacity policy and admits or rejects;
4. Swarm transitions admitted residences through rest/ready;
5. Swarm emits bounded ready-handoff capsules;
6. Swarm records departure as local lifecycle truth.

Local owner: Swarm residence lifecycle, habitat/capacity, ready-handoff, event journal and projections.  
Global owner: Atlas identity/evidence/authority/orchestration spine.

## Typed absences (intentional)

- Atlas evidence retrieval remains fail-closed in `SwarmAtlasFederation/v1` until a dedicated endpoint is introduced.
- Production outbound Atlas residence-event delivery requires host-supplied durable journal + delivery-ledger adapters.

## Swarm Hub Control wiring

`https://swarm-hub-control.lovable.app` is a control-plane metadata/audit surface.  
It is not a runtime traffic proxy.

Runtime federation edges remain:

- Atlas -> Swarm: `POST /swarm-home/events`
- Swarm -> Atlas: `POST /api/public/v1/events`

Control-plane records should track tenant, instance, credential authority, and audit lineage for those edges.

## Key generation and pairing

Generate secrets in deployment secret storage (never in source, docs examples, or CI logs).

Example generation commands:

```bash
openssl rand -base64 48 | tr -d '\n'
```

Pairing variables:

- Swarm host secret: `SWARM_ATLAS_INGRESS_TOKEN`
- Atlas outbound config:
  - `SWARM_HANDOFF_URL` (deployed `/swarm-home/events` endpoint)
  - `SWARM_HANDOFF_TOKEN` (must match ingress token)
- Swarm outbound Atlas gateway token (scoped to event observation/reporting path)

After first successful end-to-end handoff + result return, rotate ingress and gateway tokens and preserve audit receipts for provenance.
