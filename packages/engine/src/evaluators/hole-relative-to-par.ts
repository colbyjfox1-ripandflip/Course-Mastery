import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { scoredHoles } from "../round-stats.js";

const ParamsSchema = z.object({
  relation: z.enum(["birdie_or_better", "par_or_better", "bogey_or_better"]),
  scope: z.literal("any_hole"),
});

const maxRelativeToPar: Record<z.infer<typeof ParamsSchema>["relation"], number> = {
  birdie_or_better: -1,
  par_or_better: 0,
  bogey_or_better: 1,
};

export const holeRelativeToPar: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);
  const threshold = maxRelativeToPar[params.relation];
  const hit = scoredHoles(ctx.round, ctx.course).find((h) => h.relativeToPar <= threshold);

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked: hit !== undefined,
    evidence: hit
      ? { holeNumber: hit.holeNumber, par: hit.par, strokes: hit.strokes, relativeToPar: hit.relativeToPar }
      : undefined,
  };
};
