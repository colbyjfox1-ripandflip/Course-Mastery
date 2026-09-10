import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { backNineHoles, frontNineHoles, isRangeComplete, sumStrokes } from "../round-stats.js";

const ParamsSchema = z.object({
  half: z.enum(["front", "back"]),
});

export const nineHoleThreshold: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);
  const holes = params.half === "front" ? frontNineHoles(ctx.course) : backNineHoles(ctx.course);

  if (!isRangeComplete(ctx.round, holes)) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  const nineScore = sumStrokes(ctx.round, holes)!;
  const threshold = ctx.config.ability.nineScoreThreshold;
  const unlocked = nineScore <= threshold;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { half: params.half, nineScore, threshold } : undefined,
    nearMiss: !unlocked ? { half: params.half, nineScore, threshold } : undefined,
  };
};
