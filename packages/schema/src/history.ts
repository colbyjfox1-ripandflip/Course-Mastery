import { z } from "zod";

// Player-course history: rollup data the engine needs for personal-best,
// consistency, and compression evaluators (ARCHITECTURE.md §3, §6). This
// is a data contract, not engine-internal logic, so it lives in `schema`
// alongside NormalizedRound — both `engine` and `tools/fixtures` depend on
// it without creating a cycle between them.

export const PriorRoundSummarySchema = z.object({
  roundId: z.string().uuid(),
  datePlayed: z.string().date(),
  complete: z.boolean(),
  totalScore: z.number().int().nullable(),
  frontNineScore: z.number().int().nullable(),
  backNineScore: z.number().int().nullable(),
  /** abs(totalScore - rolling 5-round average as of that round), if known. */
  deviationFromRollingAverageAtTime: z.number().nullable(),
});
export type PriorRoundSummary = z.infer<typeof PriorRoundSummarySchema>;

export const PlayerCourseHistorySchema = z.object({
  priorRoundsCount: z.number().int().min(0),
  /** Most recent first. Only as many as evaluators in play actually need. */
  priorRounds: z.array(PriorRoundSummarySchema),
  bestRoundScore: z.number().int().nullable(),
  bestFrontNineScore: z.number().int().nullable(),
  bestBackNineScore: z.number().int().nullable(),
});
export type PlayerCourseHistory = z.infer<typeof PlayerCourseHistorySchema>;
