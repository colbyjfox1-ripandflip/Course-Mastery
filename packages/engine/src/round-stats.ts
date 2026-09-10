import type { Course, HoleScore, NormalizedRound } from "@course-mastery/schema";

export interface ScoredHole {
  holeNumber: number;
  strokes: number;
  par: number;
  relativeToPar: number;
}

/** Scored holes only, in hole-number order. Untouched/no_score holes are dropped. */
export function scoredHoles(round: NormalizedRound, course: Course): ScoredHole[] {
  const parByHole = new Map(course.holes.map((h) => [h.number, h.par]));
  return round.holeScores
    .filter((h): h is Extract<HoleScore, { status: "scored" }> => h.status === "scored")
    .map((h) => {
      const par = parByHole.get(h.holeNumber);
      if (par === undefined) {
        throw new Error(`No hole ${h.holeNumber} on course ${course.slug}`);
      }
      return { holeNumber: h.holeNumber, strokes: h.strokes, par, relativeToPar: h.strokes - par };
    })
    .sort((a, b) => a.holeNumber - b.holeNumber);
}

/** True if every hole in the given range is explicitly "scored" — no untouched or no_score gaps. */
export function isRangeComplete(round: NormalizedRound, holeNumbers: number[]): boolean {
  const byHole = new Map(round.holeScores.map((h) => [h.holeNumber, h]));
  return holeNumbers.every((n) => byHole.get(n)?.status === "scored");
}

export function frontNineHoles(course: Course): number[] {
  return course.holes.filter((h) => h.number <= 9).map((h) => h.number);
}

export function backNineHoles(course: Course): number[] {
  return course.holes.filter((h) => h.number > 9).map((h) => h.number);
}

export function sumStrokes(round: NormalizedRound, holeNumbers: number[]): number | null {
  const byHole = new Map(round.holeScores.map((h) => [h.holeNumber, h]));
  let total = 0;
  for (const n of holeNumbers) {
    const h = byHole.get(n);
    if (h?.status !== "scored") return null;
    total += h.strokes;
  }
  return total;
}

export function isFullRoundComplete(round: NormalizedRound, course: Course): boolean {
  return isRangeComplete(
    round,
    course.holes.map((h) => h.number),
  );
}
