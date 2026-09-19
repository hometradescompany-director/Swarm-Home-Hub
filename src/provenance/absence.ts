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
  readonly supersededByRef?: string;
}

export interface CreateTypedAbsenceInput {
  readonly kind: AbsenceKind;
  readonly statement: string;
  readonly observedAt: string;
  readonly sourceRef?: string;
  readonly supersededByRef?: string;
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

  const supersededByRef = input.supersededByRef?.trim();
  if (input.supersededByRef !== undefined && !supersededByRef) {
    throw new Error("typed absence supersededByRef cannot be blank when supplied");
  }
  if (supersededByRef && input.kind !== "superseded") {
    throw new Error("supersededByRef is only valid for superseded absences");
  }
  if (input.kind === "superseded" && (!sourceRef || !supersededByRef)) {
    throw new Error("superseded absence requires sourceRef and supersededByRef");
  }

  return Object.freeze({
    kind: input.kind,
    statement,
    observedAt: input.observedAt,
    ...(sourceRef ? { sourceRef } : {}),
    ...(supersededByRef ? { supersededByRef } : {})
  });
}

export function assertTypedAbsence(value: TypedAbsence): void {
  createTypedAbsence(value);
}
