import { z } from "zod";
import type { AccomplishmentDefinition } from "@course-mastery/schema";
import type { Evaluator, EvaluatorContext, UnlockResult } from "../types.js";

const ParamsSchema = z.object({
  relation: z.literal("bogey_or_better"),
  length: z.number().int().positive(),
});

const MAX_RELATIVE_TO_PAR = 1; // bogey_or_better

export const streakWithinRound: Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
): UnlockResult => {
  const params = ParamsSchema.parse(definition.params);
  const parByHole = new Map(ctx.course.holes.map((h) => [h.number, h.par]));

  let longest = 0;
  let longestStart = -1;
  let runStart = -1;
  let run = 0;

  for (const hole of [...ctx.round.holeScores].sort((a, b) => a.holeNumber - b.holeNumber)) {
    const par = parByHole.get(hole.holeNumber);
    const qualifies =
      hole.status === "scored" && par !== undefined && hole.strokes - par <= MAX_RELATIVE_TO_PAR;

    if (qualifies) {
      if (run === 0) runStart = hole.holeNumber;
      run += 1;
      if (run > longest) {
        longest = run;
        longestStart = runStart;
      }
    } else {
      run = 0;
    }
  }

  const unlocked = longest >= params.length;

  return {
    definitionSlug: definition.slug,
    definitionVersion: definition.version,
    unlocked,
    evidence: unlocked
      ? { startHole: longestStart, length: longest }
      : undefined,
    nearMiss: !unlocked ? { longestStreak: longest, needed: params.length } : undefined,
  };
};
