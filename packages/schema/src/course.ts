import { z } from "zod";

// Reference-data schemas: courses, tees, holes. See ARCHITECTURE.md §3-5.
// Tee provenance (rating/slope trustworthiness) is preserved explicitly —
// Course Mastery is not tee-scoped, but the underlying hole/tee data still
// needs an honest trail back to its source (PRODUCT_SPEC.md §8).

export const RatingSlopeProvenanceSchema = z.enum([
  "club_verified",
  "reported_not_club_verified",
  "unresolved",
]);
export type RatingSlopeProvenance = z.infer<typeof RatingSlopeProvenanceSchema>;

export const TeeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  par: z.number().int().positive(),
  totalYardage: z.number().int().positive(),
  rating: z.number().positive().nullable(),
  slope: z.number().int().positive().nullable(),
  ratingSlopeProvenance: RatingSlopeProvenanceSchema.nullable(),
});
export type Tee = z.infer<typeof TeeSchema>;

export const HoleSchema = z.object({
  number: z.number().int().min(1).max(18),
  par: z.number().int().min(3).max(6),
  // null until sourced from a source that actually carries stroke index —
  // never guessed or back-filled. See PRODUCT_SPEC.md §20 / data/courses.
  strokeIndex: z.number().int().min(1).max(18).nullable(),
  // keyed by Tee.id
  yardages: z.record(z.string(), z.number().int().positive()),
});
export type Hole = z.infer<typeof HoleSchema>;

export const CourseVerificationStatusSchema = z.enum([
  "candidate_unverified",
  "club_verified",
]);
export type CourseVerificationStatus = z.infer<typeof CourseVerificationStatusSchema>;

export const CourseLocationSchema = z.object({
  address: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});

export const CourseSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  location: CourseLocationSchema,
  holeCount: z.number().int().positive(),
  par: z.number().int().positive(),
  // Bumped whenever hole/tee data changes; stamped onto every round
  // submitted against this course (ARCHITECTURE.md §4).
  courseDataVersion: z.string().min(1),
  verificationStatus: CourseVerificationStatusSchema,
  tees: z.array(TeeSchema).min(1),
  holes: z.array(HoleSchema).min(1),
});
export type Course = z.infer<typeof CourseSchema>;
