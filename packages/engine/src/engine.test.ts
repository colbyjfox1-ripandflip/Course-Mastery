import { test } from "node:test";
import assert from "node:assert/strict";
import type { AccomplishmentDefinition, PlayerCourseHistory } from "@course-mastery/schema";
import {
  evenParRound,
  roundWithBirdieAndBogey,
  partialRound,
  frontSixStreakRound,
  grassyCreekCourse,
  emptyHistory,
  historyWithBestOf90,
  historyForConsistencyWindow,
  historyWithNinePriorRounds,
} from "@course-mastery/fixtures";
import { evaluate } from "./engine.js";
import type { EngineConfig } from "./types.js";

const config: EngineConfig = {
  engineVersion: "test-1",
  catalogVersion: "test-1",
  personalizationVersion: "test-1",
  ability: {
    roundScoreThreshold: 95,
    nineScoreThreshold: 47,
    consistencyWindowStrokes: 5,
  },
};

function def(overrides: Partial<AccomplishmentDefinition> & Pick<AccomplishmentDefinition, "slug" | "family" | "params">): AccomplishmentDefinition {
  return {
    version: 1,
    tier: "familiarity",
    name: overrides.slug,
    description: overrides.slug,
    mpValue: 10,
    active: true,
    ...overrides,
  };
}

test("hole_relative_to_par fires on a birdie", () => {
  const d = def({ slug: "any-birdie", family: "hole_relative_to_par", params: { relation: "birdie_or_better", scope: "any_hole" } });
  const result = evaluate(roundWithBirdieAndBogey, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
  assert.equal(result.results[0]!.evidence?.holeNumber, 3);
});

test("hole_relative_to_par does not fire on an all-par round", () => {
  const d = def({ slug: "any-birdie", family: "hole_relative_to_par", params: { relation: "birdie_or_better", scope: "any_hole" } });
  const result = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, false);
});

test("absence: bogey-free full round requires completeness and fires on the even-par round", () => {
  const d = def({
    slug: "bogey-free-round",
    family: "absence",
    params: { scope: "full_round", maxAllowedRelativeToPar: 1 },
  });
  const complete = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(complete.results[0]!.unlocked, true);

  const incomplete = evaluate(partialRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(incomplete.results[0]!.unlocked, false);
});

test("absence: an untouched hole never lets a completeness-gated evaluator fire, even if every scored hole qualifies", () => {
  const d = def({
    slug: "no-blowups",
    family: "absence",
    params: { scope: "full_round", maxAllowedRelativeToPar: 2 },
  });
  // partialRound has hole 5 untouched but every scored hole is at par.
  const result = evaluate(partialRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, false);
});

test("streak_within_round: 6 consecutive pars unlocks a 6-length bogey-or-better streak", () => {
  const d = def({
    slug: "streak-6",
    family: "streak_within_round",
    params: { relation: "bogey_or_better", length: 6 },
  });
  const result = evaluate(frontSixStreakRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
  assert.equal(result.results[0]!.evidence?.startHole, 1);
});

test("round_score_threshold: fires when complete and under the ability threshold", () => {
  const d = def({ slug: "break-95", family: "round_score_threshold", params: {} });
  // evenParRound totals 72, well under the 95 threshold.
  const result = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
});

test("round_score_threshold: does not fire on an incomplete round even if the scored strokes are low", () => {
  const d = def({ slug: "break-95", family: "round_score_threshold", params: {} });
  const result = evaluate(partialRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, false);
});

test("personal_best: requires a standing best, then fires when beaten", () => {
  const d = def({ slug: "new-best-round", family: "personal_best", params: { scope: "round" } });

  const noHistory = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(noHistory.results[0]!.unlocked, false, "no prior best to beat yet");

  const withHistory = evaluate(evenParRound, grassyCreekCourse, historyWithBestOf90, [d], config);
  assert.equal(withHistory.results[0]!.unlocked, true, "72 beats a standing best of 90");
  assert.equal(withHistory.results[0]!.evidence?.newBest, 72);
});

test("consistency_recent_rounds: fires when this round plus the window stays within the stroke band", () => {
  const d = def({
    slug: "consistency-3",
    family: "consistency_recent_rounds",
    params: { windowSize: 3 },
  });
  // historyForConsistencyWindow has two priors at 89 and 91; evenParRound (72)
  // is far outside a 5-stroke band, so this must NOT fire.
  const result = evaluate(evenParRound, grassyCreekCourse, historyForConsistencyWindow, [d], config);
  assert.equal(result.results[0]!.unlocked, false);
});

test("round_count_milestone: fires only on the exact matching round number", () => {
  const d = def({ slug: "tenth-round", family: "round_count_milestone", params: { atCount: 10 } });
  const result = evaluate(evenParRound, grassyCreekCourse, historyWithNinePriorRounds, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
  assert.equal(result.results[0]!.evidence?.roundNumber, 10);

  const notYet = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(notYet.results[0]!.unlocked, false);
});

test("counts_within_round: fires when enough scored holes meet the relation", () => {
  const d = def({ slug: "two-pars", family: "counts_within_round", params: { relation: "par_or_better", minCount: 2 } });
  const result = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
  assert.equal(result.results[0]!.evidence?.count, 18);
});

test("nine_hole_threshold: fires on a complete nine under the ability threshold", () => {
  const d = def({ slug: "front-nine-under-47", family: "nine_hole_threshold", params: { half: "front" } });
  // Grassy Creek front nine is par 36; threshold in this config is 47.
  const result = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
});

test("compression: fires when this round lands closer to the rolling average than any of the comparison window did", () => {
  const history: PlayerCourseHistory = {
    priorRoundsCount: 5,
    priorRounds: Array.from({ length: 5 }, (_, i) => ({
      roundId: `cccccccc-0000-0000-0000-00000000000${i + 1}`,
      datePlayed: "2026-08-0" + (i + 1),
      complete: true,
      totalScore: 80,
      frontNineScore: 40,
      backNineScore: 40,
      deviationFromRollingAverageAtTime: 20 - i * 2, // 20, 18, 16, 14, 12 -> min is 12
    })),
    bestRoundScore: 80,
    bestFrontNineScore: 40,
    bestBackNineScore: 40,
  };
  const d = def({ slug: "tighter-than-last-five", family: "compression", params: { comparisonWindow: 5 } });
  // evenParRound totals 72; rolling average of the window is 80 -> thisDeviation = 8, which beats the window's best (12).
  const result = evaluate(evenParRound, grassyCreekCourse, history, [d], config);
  assert.equal(result.results[0]!.unlocked, true);
  assert.equal(result.results[0]!.evidence?.thisDeviation, 8);
});

test("inactive definitions are excluded entirely", () => {
  const d = def({ slug: "inactive", family: "round_count_milestone", params: { atCount: 1 }, active: false });
  const result = evaluate(evenParRound, grassyCreekCourse, emptyHistory, [d], config);
  assert.equal(result.results.length, 0);
});
