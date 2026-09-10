import type { HoleScore, NormalizedRound } from "@course-mastery/schema";
import { grassyCreekCourse } from "./grassy-creek.js";

const PLAYER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Builds a NormalizedRound at Grassy Creek from a hole-number -> strokes
 * map. Holes not present in `strokes` are "untouched"; pass a hole number
 * with strokes = null explicitly (via `noScoreHoles`) to mark it
 * "no_score" instead.
 */
export function buildGrassyCreekRound(opts: {
  id: string;
  datePlayed: string;
  teeId?: string;
  strokes: Partial<Record<number, number>>;
  noScoreHoles?: number[];
  entryMethod?: NormalizedRound["entryMethod"];
}): NormalizedRound {
  const noScoreSet = new Set(opts.noScoreHoles ?? []);
  const holeScores: HoleScore[] = grassyCreekCourse.holes.map((hole): HoleScore => {
    const strokes = opts.strokes[hole.number];
    if (strokes !== undefined) {
      return { holeNumber: hole.number, status: "scored", strokes };
    }
    if (noScoreSet.has(hole.number)) {
      return { holeNumber: hole.number, status: "no_score" };
    }
    return { holeNumber: hole.number, status: "untouched" };
  });

  const complete = holeScores.every((h) => h.status === "scored");

  return {
    id: opts.id,
    playerId: PLAYER_ID,
    courseSlug: grassyCreekCourse.slug,
    courseDataVersion: grassyCreekCourse.courseDataVersion,
    teeId: opts.teeId ?? "regular",
    datePlayed: opts.datePlayed,
    entryMethod: opts.entryMethod ?? "native",
    dataTier: complete ? "complete" : "partial",
    holeScores,
  };
}

/** Every hole scored exactly at par (total 72 on the Regular tee). */
export const evenParRound = buildGrassyCreekRound({
  id: "11111111-1111-1111-1111-111111111111",
  datePlayed: "2026-09-01",
  strokes: Object.fromEntries(grassyCreekCourse.holes.map((h) => [h.number, h.par])),
});

/** Par round but with a birdie on #3 and a bogey on #6 — nets to 72 still. */
export const roundWithBirdieAndBogey = buildGrassyCreekRound({
  id: "22222222-2222-2222-2222-222222222222",
  datePlayed: "2026-09-08",
  strokes: {
    ...Object.fromEntries(grassyCreekCourse.holes.map((h) => [h.number, h.par])),
    3: 2, // birdie (par 3 -> 2)
    6: 6, // bogey (par 5 -> 6)
  },
});

/** Hole 5 left untouched — an incomplete round, used to test completeness gating. */
export const partialRound = buildGrassyCreekRound({
  id: "33333333-3333-3333-3333-333333333333",
  datePlayed: "2026-09-10",
  strokes: Object.fromEntries(
    grassyCreekCourse.holes.filter((h) => h.number !== 5).map((h) => [h.number, h.par]),
  ),
});

/** Six consecutive bogey-or-better holes (1-6, all at par), rest untouched — for streak tests. */
export const frontSixStreakRound = buildGrassyCreekRound({
  id: "44444444-4444-4444-4444-444444444444",
  datePlayed: "2026-09-12",
  strokes: Object.fromEntries(
    grassyCreekCourse.holes.filter((h) => h.number <= 6).map((h) => [h.number, h.par]),
  ),
});
