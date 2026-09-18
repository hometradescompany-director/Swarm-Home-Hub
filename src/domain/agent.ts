export type AgentIdentityRef = string & { readonly __brand: "AgentIdentityRef" };
export type CapabilityRef = string & { readonly __brand: "CapabilityRef" };
export type OfferingRef = string & { readonly __brand: "OfferingRef" };

export interface AgentReference {
  readonly identityRef: AgentIdentityRef;
  readonly capabilityRefs: readonly CapabilityRef[];
  readonly offeringRefs: readonly OfferingRef[];
}
