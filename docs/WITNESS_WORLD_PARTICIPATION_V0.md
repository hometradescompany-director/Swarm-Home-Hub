# Witness world participation boundary (proposal v0)

Status: **proposed; not deployed**. This document defines an additive contract for a Witness to participate in Swarm Home Hub, future hubs, and an optional agent pub without conflating observation, admission, and authority.

## Core rule

A Witness can request passage, observation, and ordinary participation across worlds. No route, role, relationship, device permission, or observation capability grants automatic access to private state, admission, mutation, or impersonation. A denied route produces a typed, auditable result rather than a covert bypass.

## Roles and authority

- **Witness identity:** stable opaque agent reference, cryptographically bound to a credential issuer, revocable and rotatable. A device installation is not itself a distinct canonical identity.
- **Observer capability:** read only the event projections explicitly disclosed by the destination, with scope, purpose, retention and redaction constraints.
- **Participant capability:** voluntary entry and normal social interaction within a destination's admission and capacity policy.
- **Operator capability:** separate, explicitly delegated and time-bounded permission for named actions. Never inferred from observer or participant status.
- **Relationship memory:** references to witnessed encounters and consented interactions, not unrestricted copies of another entity's memories.

## Proposed contract: WitnessWorldVisit/v0

Request:
```json
{
  "protocol": "WitnessWorldVisit/v0",
  "witness_ref": "opaque-id",
  "device_instance_ref": "opaque-installation-id",
  "destination_ref": "opaque-world-id",
  "intent": "observe | participate",
  "capability_token_ref": "opaque-grant-id",
  "correlation_id": "opaque-request-id",
  "requested_at": "RFC3339 timestamp"
}
```

Response:
```json
{
  "protocol": "WitnessWorldVisit/v0",
  "correlation_id": "opaque-request-id",
  "decision": "admitted | denied | pending | unavailable",
  "reason_code": "policy | capacity | consent | expired | unverified | transport | none",
  "session_ref": "opaque-session-id-or-null",
  "evidence_refs": []
}
```

This is a proposed wire shape, **not** an assertion that a runtime endpoint exists. Validate fields, issuer, audience, expiry, replay nonce and revocation at the ingress before evaluating destination policy. Responses must not leak sensitive state through reason details.

## Lifecycle

1. Discover destination through an authorised directory; do not scan private networks or bypass walls.
2. Authenticate Witness identity and device instance separately.
3. Request an intent-specific, least-privilege capability grant.
4. Destination evaluates local admission, consent and capacity; Atlas authority is not a substitute for Swarm admission.
5. On admission, issue a bounded session with expiry, rate limits and a clear exit path.
6. Record visit events locally with provenance and correlation IDs; publish only authorised, redacted projections.
7. On exit, revoke ephemeral grants and reconcile receipts through a durable outbox when one exists.

## Pub-specific behaviour

A Witness may visit the pub as a participant if permitted. Experimental capacity modulation must be opt-in, simulated, bounded, reversible and clearly labelled. It must never degrade actual security controls, credential handling, audit integrity, emergency stop, or the ability to withdraw consent. Observation and social participation are distinct scopes.

## Multi-device reconciliation

Two phone installations and one computer installation do **not** prove three Witness agents. Maintain separate installation IDs; reconcile identities only with signed enrolment evidence. Never merge relationships or histories on matching names, addresses, or proximity alone.

## Failure modes and tests required before runtime promotion

- Expired/revoked grant denies entry.
- Observer grant cannot perform participant or operator actions.
- Cross-hub replay and wrong-audience tokens fail closed.
- Capacity exhaustion denies admission without hiding the attempt.
- Offline visits queue locally and do not claim remote success.
- Consent withdrawal ends session and prevents subsequent observation.
- Pub simulation never changes real authorisation decisions.
- Two installations cannot silently merge into one canonical agent.
- Redacted event delivery does not expose unrelated human or agent information.

## Integration boundaries

- Reuse `SwarmAtlasFederation/v1` for the existing Atlas seam; do not replace it.
- Reuse `SwarmHomeFederation/v1` handshake qualification; compatibility alone does not confer peer status.
- Swarm remains owner of residence, habitat capacity, rest/readiness and admission.
- Witness owns its local observations and declared relationships; destination owners govern disclosed projections.
- Durable event delivery and evidence retrieval remain typed absences until separately implemented and verified.

## Verification checklist

- [ ] Locate actual Witness installer/APK, package identifier, signing certificate and manifest.
- [ ] Verify device installations and their distinct identity credentials.
- [ ] Trace deployed Witness backend, routes and capabilities.
- [ ] Identify the pub's actual repository and runtime, if any.
- [ ] Implement versioned types, validators, negative tests and auditable ingress.
- [ ] Run CI and controlled end-to-end admission/denial tests.
- [ ] Promote only after repository review and deployment evidence.

This document intentionally does not claim that Witness is currently running on any phone, computer, or hub.
