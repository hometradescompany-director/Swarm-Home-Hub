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

export interface CreateTypedAbsenceInput {
  readonly kind: AbsenceKind;
  readonly statement: string;
  readonly observedAt: string;
  readonly sourceRef?: string;
}

export function createTypedAbsence(input: CreateTypedAbsenceInput): TypedAbsence {
  const statement = input.statement.trim();
  if (!statement) {
    throw new Error("typed absence requires a non-empty statement");
  }

  if (!Number.isFinite(Date.parse(input.observedAt))) {
    throw new Error("typed absence observedAt must be a valid ISO-8601 value");
  }

  const sourceRef = input.sourceRef?.trim();
  if (input.sourceRef !== undefined && !sourceRef) {
    throw new Error("typed absence sourceRef cannot be blank when supplied");
  }

  return Object.freeze({
    kind: input.kind,
    statement,
    observedAt: input.observedAt,
    ...(sourceRef ? { sourceRef } : {})
  });
}

export function assertTypedAbsence(value: TypedAbsence): void {
  createTypedAbsence(value);
}
