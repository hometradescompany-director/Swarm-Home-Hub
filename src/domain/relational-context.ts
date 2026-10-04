/**
 * Opaque Atlas relational-context reference.
 *
 * Swarm may carry this reference through a handoff but does not interpret it.
 * Atlas remains the truth owner for any underlying communication, relationship,
 * provenance or observed-effect context.
 */
export type RelationalContextRef = string & { readonly __brand: "RelationalContextRef" };

export interface RelationalContextCapsule {
  readonly refs: readonly RelationalContextRef[];
  readonly authorityImplication: "none";
}
