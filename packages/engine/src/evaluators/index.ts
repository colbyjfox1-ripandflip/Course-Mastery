import type { EvaluatorFamily } from "@course-mastery/schema";
import type { Evaluator } from "../types.js";
import { holeRelativeToPar } from "./hole-relative-to-par.js";
import { countsWithinRound } from "./counts-within-round.js";
import { roundScoreThreshold } from "./round-score-threshold.js";
import { nineHoleThreshold } from "./nine-hole-threshold.js";
import { streakWithinRound } from "./streak-within-round.js";
import { absence } from "./absence.js";
import { consistencyRecentRounds } from "./consistency-recent-rounds.js";
import { compression } from "./compression.js";
import { personalBest } from "./personal-best.js";
import { roundCountMilestone } from "./round-count-milestone.js";

export const evaluatorRegistry: Record<EvaluatorFamily, Evaluator> = {
  hole_relative_to_par: holeRelativeToPar,
  counts_within_round: countsWithinRound,
  round_score_threshold: roundScoreThreshold,
  nine_hole_threshold: nineHoleThreshold,
  streak_within_round: streakWithinRound,
  absence,
  consistency_recent_rounds: consistencyRecentRounds,
  compression,
  personal_best: personalBest,
  round_count_milestone: roundCountMilestone,
};
