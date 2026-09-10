import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { scoredHoles } from "../round-stats.js";

const ParamsSchema = z.object({
  relation: z.enum(["birdie_or_better", "par_or_better"]),
  minCount: z.number().int().positive(),
});

const maxRelativeToPar: Record<z.infer<typeof ParamsSchema>["relation"], number> = {
  birdie_or_better: -1,
  par_or_better: 0,
};

export const countsWithinRound: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);
  const threshold = maxRelativeToPar[params.relation];
  const matches = scoredHoles(ctx.round, ctx.course).filter((h) => h.relativeToPar <= threshold);
  const unlocked = matches.length >= params.minCount;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked
      ? { count: matches.length, holeNumbers: matches.map((h) => h.holeNumber) }
      : undefined,
    nearMiss: !unlocked ? { count: matches.length, needed: params.minCount } : undefined,
  };
};
