export type AbsenceKind =
  | "never_existed"
  | "not_searched"
  | "searched_no_adequate_match"
  | "cannot_be_located"
  | "inaccessible"
  | "deliberately_deleted"
  | "superseded"
  | "corrupted"
  | "rejected_by_validation"
  | "provenance_lost"
  | "status_unknown";

export interface TypedAbsence {
  readonly kind: AbsenceKind;
  readonly statement: string;
  readonly observedAt: string;
  readonly sourceRef?: string;
}
