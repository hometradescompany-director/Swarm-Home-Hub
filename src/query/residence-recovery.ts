import type { ResidenceId, ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import { createTypedAbsence, type TypedAbsence } from "../provenance/absence.js";
import { projectResidence } from "../projection/residence.js";
import {
  projectResidenceTimeline,
  type ResidenceTimelineEntry
} from "./residence-timeline.js";

export type ResidenceRecovery =
  | {
      readonly found: true;
      readonly residence: ResidenceSnapshot;
      readonly timeline: readonly ResidenceTimelineEntry[];
    }
  | {
      readonly found: false;
      readonly absence: TypedAbsence;
    };

export async function recoverResidence(
  journal: EventJournal,
  residenceId: ResidenceId,
  observedAt: string
): Promise<ResidenceRecovery> {
  const events = await journal.eventsForResidence(residenceId);

  if (events.length === 0) {
    return {
      found: false,
      absence: createTypedAbsence({
        kind: "cannot_be_located",
        statement: `No residence events can be located for ${residenceId} in this journal.`,
        observedAt,
        sourceRef: `swarm:event-journal:${residenceId}`
      })
    };
  }

  try {
    const residence = projectResidence(events);
    if (!residence) {
      return {
        found: false,
        absence: createTypedAbsence({
          kind: "status_unknown",
          statement: `Residence state is unknown for ${residenceId}.`,
          observedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        })
      };
    }

    return {
      found: true,
      residence,
      timeline: projectResidenceTimeline(events)
    };
  } catch (error) {
    return {
      found: false,
      absence: createTypedAbsence({
        kind: "corrupted",
        statement:
          error instanceof Error
            ? `Residence history could not be projected: ${error.message}`
            : "Residence history could not be projected.",
        observedAt,
        sourceRef: `swarm:event-journal:${residenceId}`
      })
    };
  }
}
