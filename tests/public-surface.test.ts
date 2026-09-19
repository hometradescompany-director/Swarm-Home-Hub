import { describe, expect, it } from "vitest";
import {
  AdmissionService,
  DepartureService,
  InMemoryEventJournal,
  InMemoryHabitatRegistry,
  RejectionService,
  ResidenceService,
  RestService,
  RequestService,
  activeResidencesForHabitat,
  projectResidenceIndex
} from "../src/index.js";

describe("phase-one public surface", () => {
  it("publishes the bounded residence lifecycle without reaching into internal paths", () => {
    expect(AdmissionService).toBeTypeOf("function");
    expect(DepartureService).toBeTypeOf("function");
    expect(RejectionService).toBeTypeOf("function");
    expect(ResidenceService).toBeTypeOf("function");
    expect(RestService).toBeTypeOf("function");
    expect(RequestService).toBeTypeOf("function");
    expect(InMemoryEventJournal).toBeTypeOf("function");
    expect(InMemoryHabitatRegistry).toBeTypeOf("function");
    expect(activeResidencesForHabitat).toBeTypeOf("function");
    expect(projectResidenceIndex).toBeTypeOf("function");
  });
});
