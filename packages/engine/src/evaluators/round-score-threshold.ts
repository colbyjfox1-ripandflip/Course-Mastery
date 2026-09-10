import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { isFullRoundComplete } from "../round-stats.js";

// No params today — the threshold itself comes from EngineConfig.ability,
// resolved upstream by packages/personalize (PRODUCT_SPEC.md §9). Kept as
// a family so its own params can grow (e.g. relative-to-par vs absolute)
// without touching other families.
const ParamsSchema = z.object({});

export const roundScoreThreshold: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  ParamsSchema.parse(definition.params);

  if (!isFullRoundComplete(ctx.round, ctx.course)) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  const totalScore = ctx.round.holeScores.reduce(
    (sum, h) => sum + (h.status === "scored" ? h.strokes : 0),
    0,
  );
  const threshold = ctx.config.ability.roundScoreThreshold;
  const unlocked = totalScore <= threshold;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { totalScore, threshold } : undefined,
    nearMiss: !unlocked ? { totalScore, threshold, short: totalScore - threshold } : undefined,
  };
};
