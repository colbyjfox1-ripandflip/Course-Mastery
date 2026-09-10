import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { isFullRoundComplete } from "../round-stats.js";

const ParamsSchema = z.object({
  windowSize: z.number().int().min(2),
});

export const consistencyRecentRounds: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);

  if (!isFullRoundComplete(ctx.round, ctx.course)) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }
  const thisTotal = ctx.round.holeScores.reduce(
    (sum, h) => sum + (h.status === "scored" ? h.strokes : 0),
    0,
  );

  const needed = params.windowSize - 1;
  const window = ctx.history.priorRounds.slice(0, needed);
  if (window.length < needed || window.some((r) => !r.complete || r.totalScore === null)) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  const scores = [thisTotal, ...window.map((r) => r.totalScore as number)];
  const spread = Math.max(...scores) - Math.min(...scores);
  const unlocked = spread <= ctx.config.ability.consistencyWindowStrokes;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { scores, spread } : undefined,
    nearMiss: !unlocked ? { scores, spread, maxAllowed: ctx.config.ability.consistencyWindowStrokes } : undefined,
  };
};
