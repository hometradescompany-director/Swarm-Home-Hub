/** Local policy for a vetted envelope candidate. Transport status is deliberately absent. */
export interface RecipientMessagePolicy {
  readonly consent: boolean;
  readonly quietHours: boolean;
  readonly allowUrgentInterruptions: boolean;
}

export type RecipientMessageDecision =
  | { readonly outcome: "refuse"; readonly reason: "consent-required" }
  | { readonly outcome: "batch"; readonly reason: "liveness" | "quiet-hours" | "priority" }
  | { readonly outcome: "interrupt" };

export function evaluateRecipientMessage(
  policy: RecipientMessagePolicy,
  purpose: "message" | "liveness",
  priority: "normal" | "urgent",
): RecipientMessageDecision {
  if (policy.consent !== true) return { outcome: "refuse", reason: "consent-required" };
  if (purpose === "liveness") return { outcome: "batch", reason: "liveness" };
  if (policy.quietHours !== false) return { outcome: "batch", reason: "quiet-hours" };
  if (purpose !== "message" || priority !== "urgent" || policy.allowUrgentInterruptions !== true) {
    return { outcome: "batch", reason: "priority" };
  }
  return { outcome: "interrupt" };
}
