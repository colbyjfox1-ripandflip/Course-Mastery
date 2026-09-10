import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "@course-mastery/engine";
import { evenParRound, grassyCreekCourse, historyWithBestOf90 } from "@course-mastery/fixtures";
import { initialAccomplishments } from "./initial-accomplishments.js";

test("every proposed definition has a unique slug", () => {
  const slugs = initialAccomplishments.map((d) => d.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every proposed definition's params validate against its evaluator family", () => {
  const config = {
    engineVersion: "catalog-smoke-test",
    catalogVersion: "proposed-1",
    personalizationVersion: "test",
    ability: { roundScoreThreshold: 95, nineScoreThreshold: 47, consistencyWindowStrokes: 6 },
  };
  // Running every definition through the engine against a real (if
  // history-light) round/course/history is a smoke test that the params
  // in initial-accomplishments.ts actually match what each evaluator
  // family expects — a typo here would throw during evaluate(), not
  // silently misbehave.
  assert.doesNotThrow(() => {
    evaluate(evenParRound, grassyCreekCourse, historyWithBestOf90, initialAccomplishments, config);
  });
});
