import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { isFullRoundComplete } from "../round-stats.js";

// Simple, early-flavor compression (PRODUCT_SPEC.md §4): this round lands
// closer to the player's recent rolling average than any of their last N
// rounds did at the time. The fuller compression family (spread narrowing
// over long windows) is intentionally deferred past the walking skeleton.
const ParamsSchema = z.object({
  comparisonWindow: z.number().int().min(2),
});

export const compression: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);

  if (!isFullRoundComplete(ctx.round, ctx.course)) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  const window = ctx.history.priorRounds.slice(0, params.comparisonWindow);
  const eligible =
    window.length === params.comparisonWindow &&
    window.every((r) => r.complete && r.totalScore !== null && r.deviationFromRollingAverageAtTime !== null);

  if (!eligible) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  const thisTotal = ctx.round.holeScores.reduce(
    (sum, h) => sum + (h.status === "scored" ? h.strokes : 0),
    0,
  );
  const rollingAverage =
    window.reduce((sum, r) => sum + (r.totalScore as number), 0) / window.length;
  const thisDeviation = Math.abs(thisTotal - rollingAverage);
  const pastDeviations = window.map((r) => r.deviationFromRollingAverageAtTime as number);
  const bestPastDeviation = Math.min(...pastDeviations);
  const unlocked = thisDeviation < bestPastDeviation;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { thisDeviation, bestPastDeviation, rollingAverage } : undefined,
    nearMiss: !unlocked ? { thisDeviation, bestPastDeviation } : undefined,
  };
};
