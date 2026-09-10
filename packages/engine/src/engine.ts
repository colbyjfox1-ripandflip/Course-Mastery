import type { AccomplishmentDefinition, Course, NormalizedRound } from "@course-mastery/schema";
import type { EngineConfig, EvaluationResult, PlayerCourseHistory } from "./types.js";
import { evaluatorRegistry } from "./evaluators/index.js";

/**
 * Pure function: same inputs always produce the same result, which is what
 * makes historical evaluations replayable (ARCHITECTURE.md §6, §12). Zero
 * I/O — the caller (an Edge Function in production) is responsible for
 * loading the course, player history, and definitions, and for persisting
 * the result.
 */
export function evaluate(
  round: NormalizedRound,
  course: Course,
  history: PlayerCourseHistory,
  definitions: AccomplishmentDefinition[],
  config: EngineConfig,
): EvaluationResult {
  const results = definitions
    .filter((d) => d.active)
    .map((definition) => {
      const evaluator = evaluatorRegistry[definition.family];
      return evaluator(definition, { round, course, history, config });
    });

  return {
    roundId: round.id,
    engineVersion: config.engineVersion,
    catalogVersion: config.catalogVersion,
    results,
  };
}
