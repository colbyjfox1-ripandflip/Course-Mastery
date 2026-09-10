import { CourseSchema } from "@course-mastery/schema";
import raw from "../../../data/courses/grassy-creek/scorecard.candidate.json" with { type: "json" };

// This wires the STAGED CANDIDATE Grassy Creek data (see
// data/courses/grassy-creek/README.md) into engine fixtures so evaluators
// can be exercised against real, if not-yet-club-verified, hole data.
// courseDataVersion carries the "candidate-" prefix precisely so nothing
// downstream can mistake this for authoritative seed data.
export const grassyCreekCourse = CourseSchema.parse({
  ...raw.course,
  tees: raw.tees,
  holes: raw.holes,
});
