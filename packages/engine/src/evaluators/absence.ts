import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";
import { backNineHoles, frontNineHoles, isRangeComplete, scoredHoles } from "../round-stats.js";

const ParamsSchema = z.object({
  scope: z.enum(["full_round", "nine"]),
  half: z.enum(["front", "back"]).optional(),
  // null => this definition is a pure completeness check (e.g.
  // "nine-holes-tracked"); a number caps how bad the worst hole may be
  // (e.g. 1 = bogey-free, 2 = no worse than double-bogey).
  maxAllowedRelativeToPar: z.number().int().nullable(),
});

export const absence: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);
  const holes =
    params.scope === "full_round"
      ? ctx.course.holes.map((h) => h.number)
      : params.half === "front"
        ? frontNineHoles(ctx.course)
        : backNineHoles(ctx.course);

  // Completeness is a hard gate: an untouched or no_score hole in range
  // means we don't know enough to say the absence condition held
  // (PRODUCT_SPEC.md §11).
  if (!isRangeComplete(ctx.round, holes)) {
    return { definitionSlug: definition.slug, definitionVersion: definition.version, unlocked: false };
  }

  if (params.maxAllowedRelativeToPar === null) {
    return {
      definitionSlug: definition.slug,
      definitionVersion: definition.version,
      unlocked: true,
      evidence: { scope: params.scope, half: params.half },
    };
  }

  const holeSet = new Set(holes);
  const relevant = scoredHoles(ctx.round, ctx.course).filter((h) => holeSet.has(h.holeNumber));
  const worst = relevant.reduce((m, h) => Math.max(m, h.relativeToPar), -Infinity);
  const unlocked = worst <= params.maxAllowedRelativeToPar;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked ? { scope: params.scope, half: params.half, worstRelativeToPar: worst } : undefined,
    nearMiss: !unlocked ? { worstRelativeToPar: worst, maxAllowed: params.maxAllowedRelativeToPar } : undefined,
  };
};
