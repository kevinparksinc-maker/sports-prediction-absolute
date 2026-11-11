import { describe, expect, it } from "vitest";
import { validateSportsPrediction } from "./sportsPredictor";
import type { GameChartSnapshot, MethodResult } from "../../shared/simulationLab/contracts";

const snapshot = {
  id: "game-test",
  generatedAt: "2026-11-07T18:00:00Z",
  league: "NFL",
  scheduledStart: "2026-11-07T18:00:00Z",
  venue: { name: "Test stadium", latitude: 32, longitude: -96, timezone: "America/Chicago" },
  ascTeam: "ASC Team",
  descTeam: "DESC Team",
  chartEvidence: [{ id: "chart:body:venus:house", description: "Venus H1", value: 1 }],
  physicalEvidence: [],
  chartVersion: "test",
} satisfies GameChartSnapshot;
const methods = [{
  methodId: "sports-team-house-occupancy",
  methodName: "House baseline",
  verdict: "asc",
  ascScore: 5,
  descScore: 3,
  evidenceIds: ["chart:body:venus:house"],
  what: "Venus in ASC house",
  why: "Weighted house tally",
  consequence: "ASC advantage",
  limitations: [],
}] satisfies MethodResult[];
const response = {
  selectedSide: "asc",
  reasoning: "The calculated symbolic score favors the ASC side because Venus occupies an ASC-team house. This remains a tentative interpretation rather than a prediction calibrated to win rates.",
  keyFactors: [{ methodId: methods[0].methodId, finding: "Venus house occupancy supports ASC team devotion symbolism.", evidenceIds: ["chart:body:venus:house"] }],
  contraryEvidence: "This method omits all other methods and cannot establish an objective win probability.",
  conditions: "Team form, venue conditions, injuries and weather could change a real contest.",
  confidence: "low",
  methodsReviewed: [methods[0].methodId],
} as const;
describe("Sports AI verdict evidence audit", () => {
  it("accepts grounded calculated picks without inventing probabilities", () => {
    const result = validateSportsPrediction(response, snapshot, methods);
    expect(result.team).toBe("ASC Team");
    expect(result.calculatedScore).toEqual({ asc: 5, desc: 3 });
    expect(result.warning).toContain("not win probabilities");
  });
  it("rejects unsupported evidence references", () => {
    const bad = { ...response, keyFactors: [{ ...response.keyFactors[0], evidenceIds: ["invented"] }] };
    expect(() => validateSportsPrediction(bad, snapshot, methods)).toThrow("Unsupported evidence");
  });
  it("allows an independently reasoned AI side to disagree with symbolic totals", () => {
    const result = validateSportsPrediction({ ...response, selectedSide: "desc" }, snapshot, methods);
    expect(result.team).toBe("DESC Team");
    expect(result.calculatedScore).toEqual({ asc: 5, desc: 3 });
  });
  it("permits an evidence-grounded no-pick without erasing the baseline", () => {
    const result = validateSportsPrediction({ ...response, selectedSide: "no-pick" }, snapshot, methods);
    expect(result.team).toBeNull();
    expect(result.calculatedScore).toEqual({ asc: 5, desc: 3 });
  });
  it("rejects omitted method audits", () => {
    expect(() => validateSportsPrediction({ ...response, methodsReviewed: [] }, snapshot, methods))
      .toThrow("Every method must be reviewed");
  });
});
