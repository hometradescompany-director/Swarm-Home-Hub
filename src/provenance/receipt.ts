import type { TypedAbsence } from "./absence.js";

export type EvidenceStanding =
  | "direct_observation"
  | "source_record"
  | "user_report"
  | "supported_inference"
  | "hypothesis"
  | "unknown";

export interface ProvenanceReceipt {
  readonly id: string;
  readonly sourceRef: string;
  readonly capturedAt: string;
  readonly standing: EvidenceStanding;
  readonly authorityRef?: string;
  readonly contentHash?: string;
  readonly absence?: TypedAbsence;
}
