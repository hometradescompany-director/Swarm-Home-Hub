import type { HabitatState, TypedAbsence } from "../src/index.ts";

export type HabitatView =
  | { readonly kind: "projected"; readonly state: HabitatState; readonly eventIds: readonly string[] }
  | { readonly kind: "unknown"; readonly absence: TypedAbsence };

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]!);

export function renderHabitatView(view: HabitatView): string {
  if (view.kind === "unknown") {
    return `<section class="section" aria-labelledby="habitat-heading">
      <h2 id="habitat-heading">Habitat status unknown</h2>
      <p>Unavailable (${escapeHtml(view.absence.kind)}): ${escapeHtml(view.absence.statement)}</p>
    </section>`;
  }

  const { state, eventIds } = view;
  return `<section class="section" aria-labelledby="habitat-heading">
    <h2 id="habitat-heading">Habitat capacity</h2>
    <p>Local projection for ${escapeHtml(state.habitatId)}. Status: ${escapeHtml(state.status)}.</p>
    <dl>
      <div><dt>Occupied</dt><dd>${state.occupied}</dd></div>
      <div><dt>Available</dt><dd>${state.available}</dd></div>
      <div><dt>Capacity</dt><dd>${state.capacity}</dd></div>
    </dl>
    <p>Admissions: ${state.acceptingAdmissions ? "accepting" : "not accepting"}.</p>
    <p>Residence source events: ${eventIds.length ? eventIds.map(escapeHtml).join(", ") : "none"}.
      Capacity and status come from local habitat configuration, not residence events.</p>
  </section>`;
}
