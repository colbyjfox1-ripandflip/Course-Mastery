import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";

const ParamsSchema = z.object({
  atCount: z.number().int().positive(),
});

export const roundCountMilestone: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);
  const roundNumber = ctx.history.priorRoundsCount + 1;
  const unlocked = roundNumber === params.atCount;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { roundNumber } : undefined,
  };
};
