import type { Habitat } from "../src/domain/habitat.js";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { projectHabitatState } from "../src/query/habitat-state.js";

export type ResidentViewStatus = ResidenceSnapshot["status"] | "unknown";

export interface HabitatResidentView {
  readonly label: string;
  readonly status: ResidentViewStatus;
}

export interface HabitatView {
  readonly name: string;
  readonly status: Habitat["status"] | "unknown";
  readonly capacity: number | null;
  readonly occupied: number | null;
  readonly available: number | null;
  readonly summary: string;
  readonly residents: readonly HabitatResidentView[];
}

const KNOWN: readonly string[] = [
  "requested", "admitted", "resting", "ready", "departed", "rejected"
];

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

/**
 * Pure view model over existing projections. Capacity/occupancy comes from
 * projectHabitatState(); anything that cannot be projected renders as an
 * explicit "unknown" rather than a guessed value. Resident labels are
 * positional aliases so no identity material reaches the DOM.
 */
export function buildHabitatView(
  habitat: Habitat | null,
  residences: readonly (ResidenceSnapshot | null)[]
): HabitatView {
  const residents = residences
    .filter((r): r is ResidenceSnapshot => r !== null)
    .map((r, i): HabitatResidentView => ({
      label: `Resident ${i + 1}`,
      status: KNOWN.includes(r.status) ? r.status : "unknown"
    }));

  if (!habitat) {
    return {
      name: "Unknown habitat", status: "unknown", capacity: null, occupied: null,
      available: null, summary: "Habitat state unknown", residents
    };
  }

  try {
    const state = projectHabitatState(habitat, residences.filter((r): r is ResidenceSnapshot => r !== null));
    return {
      name: habitat.name,
      status: state.status,
      capacity: state.capacity,
      occupied: state.occupied,
      available: state.available,
      summary: `${habitat.name}: ${state.status}, ${state.occupied} of ${state.capacity} places occupied`,
      residents
    };
  } catch {
    return {
      name: habitat.name, status: "unknown", capacity: null, occupied: null,
      available: null, summary: `${habitat.name}: capacity unknown`, residents
    };
  }
}

export function renderHabitatView(view: HabitatView): string {
  const items = view.residents
    .map((r) => `<li class="resident-dot ${escapeHtml(r.status)}"><span>${escapeHtml(r.label)}</span><small>${escapeHtml(r.status)}</small></li>`)
    .join("");
  return `<section class="habitat-view" role="group" aria-label="${escapeHtml(view.summary)}">
<strong>${escapeHtml(view.name)}</strong><small>habitat ${escapeHtml(view.status)}</small>
<ul aria-label="Residents">${items}</ul></section>`;
}
