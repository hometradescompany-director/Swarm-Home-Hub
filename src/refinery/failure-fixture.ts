export type FailureTargetPhase =
  | "fault_replay_concurrency"
  | "security_authority"
  | "scale_projection"
  | "interoperability";

export interface FailureObservation {
  readonly failureRef: string;
  readonly sourceEvidenceRef: string;
  readonly targetPhase: FailureTargetPhase;
  readonly expectedInvariant: string;
}

export interface FailureFixtureCandidate extends FailureObservation {
  readonly fixtureOnly: true;
}

export function extractFailureFixture(
  observation: FailureObservation
): FailureFixtureCandidate {
  const failureRef = observation.failureRef.trim();
  const sourceEvidenceRef = observation.sourceEvidenceRef.trim();
  const expectedInvariant = observation.expectedInvariant.trim();
  if (!failureRef || !sourceEvidenceRef || !expectedInvariant) {
    throw new Error("failure fixture requires ref, evidence and invariant");
  }
  return Object.freeze({
    failureRef,
    sourceEvidenceRef,
    targetPhase: observation.targetPhase,
    expectedInvariant,
    fixtureOnly: true,
  });
}
