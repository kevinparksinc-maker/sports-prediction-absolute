import { describe, expect, it } from "vitest";
import { runSymbolicScenarios } from "./scenarios";
import type { MethodResult } from "../../shared/simulationLab/contracts";

const method: MethodResult = {
  methodId: "house", methodName: "House", verdict: "asc",
  ascScore: 35, descScore: 20, evidenceIds: [], what: "", why: "", consequence: "", limitations: []
};
describe("reproducible symbolic sports scenarios", () => {
  it.each([1, 200, 1000, 10000] as const)("runs %s deterministic scenarios", runs => {
    const first = runSymbolicScenarios("NCAAB:fixture", [method], runs);
    expect(first).toEqual(runSymbolicScenarios("NCAAB:fixture", [method], runs));
    expect(first.ascScenarios + first.descScenarios + first.ties).toBe(runs);
    expect(first.ascShare + first.descShare + first.ties / runs).toBeCloseTo(1);
  });
  it("rejects an unsupported count", () => {
    expect(() => runSymbolicScenarios("game", [method], 50 as 1000)).toThrow();
  });
  it("refuses to produce simulations from absent method scores", () => {
    expect(() => runSymbolicScenarios("game", [{...method, ascScore:null, descScore:null}], 200)).toThrow();
  });
});
