import type { PlayerCourseHistory, PriorRoundSummary } from "@course-mastery/schema";

export const emptyHistory: PlayerCourseHistory = {
  priorRoundsCount: 0,
  priorRounds: [],
  bestRoundScore: null,
  bestFrontNineScore: null,
  bestBackNineScore: null,
};

const priorRound = (overrides: Partial<PriorRoundSummary> & Pick<PriorRoundSummary, "roundId" | "datePlayed">): PriorRoundSummary => ({
  complete: true,
  totalScore: 90,
  frontNineScore: 45,
  backNineScore: 45,
  deviationFromRollingAverageAtTime: null,
  ...overrides,
});

/** Four prior complete rounds, all scoring 90+ — a new round scoring under 90 is a personal best. */
export const historyWithBestOf90: PlayerCourseHistory = {
  priorRoundsCount: 4,
  priorRounds: [
    priorRound({ roundId: "aaaaaaaa-0000-0000-0000-000000000001", datePlayed: "2026-08-28", totalScore: 92, frontNineScore: 46, backNineScore: 46 }),
    priorRound({ roundId: "aaaaaaaa-0000-0000-0000-000000000002", datePlayed: "2026-08-20", totalScore: 90, frontNineScore: 45, backNineScore: 45 }),
    priorRound({ roundId: "aaaaaaaa-0000-0000-0000-000000000003", datePlayed: "2026-08-10", totalScore: 95, frontNineScore: 48, backNineScore: 47 }),
    priorRound({ roundId: "aaaaaaaa-0000-0000-0000-000000000004", datePlayed: "2026-07-30", totalScore: 93, frontNineScore: 47, backNineScore: 46 }),
  ],
  bestRoundScore: 90,
  bestFrontNineScore: 45,
  bestBackNineScore: 45,
};

/** Two prior rounds within a few strokes of each other, for consistency-window tests. */
export const historyForConsistencyWindow: PlayerCourseHistory = {
  priorRoundsCount: 2,
  priorRounds: [
    priorRound({ roundId: "bbbbbbbb-0000-0000-0000-000000000001", datePlayed: "2026-09-05", totalScore: 89 }),
    priorRound({ roundId: "bbbbbbbb-0000-0000-0000-000000000002", datePlayed: "2026-08-29", totalScore: 91 }),
  ],
  bestRoundScore: 89,
  bestFrontNineScore: 44,
  bestBackNineScore: 45,
};

/** Nine prior rounds, exactly what round-count-milestone "10th round" needs. */
export const historyWithNinePriorRounds: PlayerCourseHistory = {
  priorRoundsCount: 9,
  priorRounds: [],
  bestRoundScore: 88,
  bestFrontNineScore: 43,
  bestBackNineScore: 45,
};
