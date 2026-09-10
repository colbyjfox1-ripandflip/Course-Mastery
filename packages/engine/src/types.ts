import type {
  AccomplishmentDefinition,
  Course,
  NormalizedRound,
  PlayerCourseHistory,
} from "@course-mastery/schema";

export type { PlayerCourseHistory, PriorRoundSummary } from "@course-mastery/schema";

// Personalization is resolved to concrete numbers *before* it reaches the
// engine — the engine stays agnostic of ability-band logic
// (PRODUCT_SPEC.md §9, ARCHITECTURE.md §6).
export interface AbilityThresholds {
  roundScoreThreshold: number;
  nineScoreThreshold: number;
  consistencyWindowStrokes: number;
}

export interface EngineConfig {
  engineVersion: string;
  catalogVersion: string;
  personalizationVersion: string;
  ability: AbilityThresholds;
}

export interface UnlockResult {
  definitionSlug: string;
  definitionVersion: number;
  unlocked: boolean;
  /** Evidence when unlocked; near-miss/proximity info when not (both optional — a family may supply neither). */
  evidence?: Record<string, unknown> | undefined;
  nearMiss?: Record<string, unknown> | undefined;
}

export interface EvaluationResult {
  roundId: string;
  engineVersion: string;
  catalogVersion: string;
  results: UnlockResult[];
}

export interface EvaluatorContext {
  round: NormalizedRound;
  course: Course;
  history: PlayerCourseHistory;
  config: EngineConfig;
}

export type Evaluator = (
  definition: AccomplishmentDefinition,
  ctx: EvaluatorContext,
) => UnlockResult;
