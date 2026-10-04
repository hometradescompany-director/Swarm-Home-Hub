/**
 * SwarmAtlasFederation/v1 — product-side declaration of the Atlas seam.
 *
 * Swarm owns residence, habitat and readiness truth. Atlas supplies identity
 * mapping and a bounded authority decision. This declaration grants neither
 * side ownership of the other's domain.
 */
export const SWARM_ATLAS_FEDERATION_CONTRACT = "SwarmAtlasFederation/v1" as const;
export const ATLAS_ENTITY_CONTRACT = "atlas-entity/v1" as const;
export const ATLAS_AUTHORITY_CONTRACT = "atlas-authority/v1" as const;
export const ATLAS_EVENT_CONTRACT = "atlas-event/v1" as const;
export const SWARM_RESIDENCE_ENTER_ACTION = "swarm.residence.enter" as const;

export const SWARM_ATLAS_BOUNDARY = Object.freeze({
  owns: [
    "residence lifecycle",
    "habitat capacity and local admission policy",
    "rest/readiness state",
    "ready handoff capsules",
  ],
  knows: [
    "opaque Atlas identity references",
    "bounded Atlas authority decisions",
    "local evidence receipt references",
    "optional opaque Atlas relational-context references carried in ready handoffs",
  ],
  emits: [
    "swarm.residence.requested",
    "swarm.residence.admitted",
    "swarm.residence.rested",
    "swarm.residence.ready",
    "swarm.residence.departed",
    "swarm.residence.rejected",
  ],
  relationships: [
    "agent identity -> residence",
    "residence -> habitat",
    "residence transition -> evidence receipt",
    "local residence -> Atlas identity/authority reference",
    "ready handoff -> opaque Atlas relational-context reference",
  ],
  withheld: [
    "Atlas evidence retrieval transport until a dedicated endpoint exists",
    "Atlas relational-context resolution until a dedicated bounded contract exists",
    "raw human communications, names, relationship history, effect labels or scores in Swarm handoffs",
    "Production Atlas event delivery until the host supplies durable journal and delivery-ledger adapters",
    "any shared mutable database or implicit authority transfer",
  ],
} as const);
