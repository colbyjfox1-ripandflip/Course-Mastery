import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CourseSchema } from "@course-mastery/schema";
import { createSeedClient } from "./client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSES_DIR = path.resolve(__dirname, "../../../data/courses");

/**
 * Loads every data/courses/<slug>/scorecard.json into Supabase.
 *
 * Deliberately only ever reads a file literally named `scorecard.json` —
 * never `*.candidate.json`. A course directory holding only a candidate
 * file (like grassy-creek today, see its README.md) is skipped with a
 * loud warning, not silently or partially loaded. This keeps "don't treat
 * unverified course data as authoritative" enforced by the tool itself,
 * not just by convention.
 */
async function main() {
  const client = createSeedClient();
  const entries = await readdir(COURSES_DIR, { withFileTypes: true });
  const courseDirs = entries.filter((e) => e.isDirectory());

  let seeded = 0;
  let skipped = 0;

  for (const dir of courseDirs) {
    const scorecardPath = path.join(COURSES_DIR, dir.name, "scorecard.json");
    let raw: string;
    try {
      raw = await readFile(scorecardPath, "utf-8");
    } catch {
      console.warn(`SKIP ${dir.name}: no scorecard.json (only a *.candidate.json, or nothing) — not seeding.`);
      skipped += 1;
      continue;
    }

    const parsed = JSON.parse(raw);
    const course = CourseSchema.parse({ ...parsed.course, tees: parsed.tees, holes: parsed.holes });

    if (course.verificationStatus !== "club_verified") {
      console.warn(
        `SKIP ${dir.name}: scorecard.json exists but verificationStatus is "${course.verificationStatus}", ` +
          `not "club_verified" — refusing to seed. See data/courses/${dir.name}/README.md.`,
      );
      skipped += 1;
      continue;
    }

    const { error: courseError } = await client.from("courses").upsert({
      slug: course.slug,
      name: course.name,
      location: course.location,
      hole_count: course.holeCount,
      par: course.par,
      course_data_version: course.courseDataVersion,
      verification_status: course.verificationStatus,
    });
    if (courseError) throw courseError;

    const { error: teesError } = await client.from("tees").upsert(
      course.tees.map((tee) => ({
        id: tee.id,
        course_slug: course.slug,
        name: tee.name,
        par: tee.par,
        total_yardage: tee.totalYardage,
        rating: tee.rating,
        slope: tee.slope,
        rating_slope_provenance: tee.ratingSlopeProvenance,
      })),
    );
    if (teesError) throw teesError;

    const { error: holesError } = await client.from("holes").upsert(
      course.holes.map((hole) => ({
        course_slug: course.slug,
        number: hole.number,
        par: hole.par,
        stroke_index: hole.strokeIndex,
        yardages: hole.yardages,
      })),
    );
    if (holesError) throw holesError;

    console.log(`SEEDED ${dir.name}: ${course.name} (${course.holeCount} holes, ${course.tees.length} tees)`);
    seeded += 1;
  }

  console.log(`\nDone. Seeded ${seeded} course(s), skipped ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
