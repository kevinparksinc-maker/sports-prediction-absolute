/** Seeded scenario exploration; NOT calibrated win probabilities or simulated actual game scores. */
import type { MethodResult } from "../../shared/simulationLab/contracts";

export type SimulationCount = 1 | 200 | 1000 | 10000;
export type ScenarioSummary = {
  runs: SimulationCount;
  seed: number;
  ascScenarios: number;
  descScenarios: number;
  ties: number;
  ascShare: number;
  descShare: number;
  averageSymbolicMargin: number;
  caution: string;
};

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function runSymbolicScenarios(id: string, methods: readonly MethodResult[], runs: SimulationCount): ScenarioSummary {
  if (![1, 200, 1000, 10000].includes(runs)) throw new Error("Unsupported scenario count");
  const scored = methods.filter(m => m.ascScore !== null && m.descScore !== null);
  if (!scored.length) throw new Error("No scored methods for scenario analysis");
  const seed = hashSeed(id + "|" + methods.map(m => m.methodId + ":" + m.ascScore + ":" + m.descScore).join("|"));
  const rand = random(seed);
  const a = scored.reduce((s, m) => s + (m.ascScore ?? 0), 0);
  const d = scored.reduce((s, m) => s + (m.descScore ?? 0), 0);
  // Add equal zero-centered symbolic perturbations. Not a model of game scoring or outcome frequency.
  const noise = Math.max(1, (a + d) * 0.18);
  let ascScenarios = 0, descScenarios = 0, ties = 0, margins = 0;
  for (let i = 0; i < runs; i++) {
    const margin = a - d + (rand() + rand() - 1) * 2 * noise;
    margins += margin;
    if (Math.abs(margin) < 0.00001) ties++;
    else if (margin > 0) ascScenarios++;
    else descScenarios++;
  }
  return {
    runs, seed, ascScenarios, descScenarios, ties,
    ascShare: ascScenarios / runs,
    descShare: descScenarios / runs,
    averageSymbolicMargin: Math.round((margins / runs) * 100) / 100,
    caution: "Experimental sensitivity scenarios only. Scenario shares are NOT actual win probabilities, point spreads, or betting advice.",
  };
}
