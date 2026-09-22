import type {
  IntegrationPosture,
  IntegrationPostureDecision,
} from "../refinery/integration-posture.js";

export interface IntegrationPostureDrift {
  readonly changed: boolean;
  readonly before: IntegrationPosture;
  readonly after: IntegrationPosture;
  readonly evidenceRefs: readonly string[];
}

export function compareIntegrationPosture(
  before: IntegrationPostureDecision,
  after: IntegrationPostureDecision
): IntegrationPostureDrift {
  return Object.freeze({
    changed: before.posture !== after.posture,
    before: before.posture,
    after: after.posture,
    evidenceRefs: Object.freeze([
      ...new Set([...before.evidenceRefs, ...after.evidenceRefs]),
    ].sort()),
  });
}
