import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { backNineHoles, frontNineHoles, isFullRoundComplete, isRangeComplete, sumStrokes } from "../round-stats.js";

const ParamsSchema = z.object({
  scope: z.enum(["round", "nine"]),
  half: z.enum(["front", "back"]).optional(),
});

export const personalBest: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);

  let thisScore: number | null;
  let best: number | null;

  if (params.scope === "round") {
    if (!isFullRoundComplete(ctx.round, ctx.course)) {
      return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
    }
    thisScore = ctx.round.holeScores.reduce((sum, h) => sum + (h.status === "scored" ? h.strokes : 0), 0);
    best = ctx.history.bestRoundScore;
  } else {
    const holes = params.half === "front" ? frontNineHoles(ctx.course) : backNineHoles(ctx.course);
    if (!isRangeComplete(ctx.round, holes)) {
      return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
    }
    thisScore = sumStrokes(ctx.round, holes);
    best = params.half === "front" ? ctx.history.bestFrontNineScore : ctx.history.bestBackNineScore;
  }

  // Requires a prior best to beat — the very first round trivially "sets"
  // a best but that's not a meaningful displacement (PRODUCT_SPEC.md §7's
  // personal-best-displacement framing implies beating a standing best).
  if (best === null || thisScore === null) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  const unlocked = thisScore < best;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { scope: params.scope, half: params.half, newBest: thisScore, previousBest: best } : undefined,
    nearMiss: !unlocked ? { thisScore, best, short: thisScore - best } : undefined,
  };
};
