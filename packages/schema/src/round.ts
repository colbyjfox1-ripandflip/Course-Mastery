import { z } from "zod";

// Normalized round contract. See PRODUCT_SPEC.md §12 and ARCHITECTURE.md
// §11. Every ingestion path (native entry, manual post-round entry, image
// import) converges on this shape before the engine ever sees a round.

export const EntryMethodSchema = z.enum([
  "native",
  "manual_post_round",
  "image_import",
]);
export type EntryMethod = z.infer<typeof EntryMethodSchema>;

// Tri-state hole score, per PRODUCT_SPEC.md §11. "untouched" and
// "no_score" are both distinct from an explicit numeric score, and neither
// may satisfy a completeness-gated evaluator (see engine's absence family).
export const HoleScoreSchema = z.discriminatedUnion("status", [
  z.object({ holeNumber: z.number().int().min(1).max(18), status: z.literal("untouched") }),
  z.object({
    holeNumber: z.number().int().min(1).max(18),
    status: z.literal("scored"),
    strokes: z.number().int().min(1),
  }),
  z.object({ holeNumber: z.number().int().min(1).max(18), status: z.literal("no_score") }),
]);
export type HoleScore = z.infer<typeof HoleScoreSchema>;

// Overall completeness of the round's data, derived from HoleScore
// statuses (never asserted independently by the client) — see
// packages/engine's round-stats helper.
export const DataTierSchema = z.enum(["complete", "partial"]);
export type DataTier = z.infer<typeof DataTierSchema>;

export const RoundProvenanceSchema = z.object({
  // Name of the originating app/source, if known/asserted (e.g. "GHIN",
  // "18Birdies") — informational only, never assumed to imply an
  // integration or verified format (PRODUCT_SPEC.md §10.1).
  sourceApp: z.string().optional(),
  // Only meaningful for image_import: the extraction model's confidence,
  // if available.
  importConfidence: z.number().min(0).max(1).optional(),
  rawSourceNote: z.string().optional(),
});
export type RoundProvenance = z.infer<typeof RoundProvenanceSchema>;

export const NormalizedRoundSchema = z.object({
  // Client-generated; submission is idempotent on this id
  // (PRODUCT_SPEC.md §12).
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  courseSlug: z.string().min(1),
  courseDataVersion: z.string().min(1),
  teeId: z.string().min(1),
  datePlayed: z.string().date(),
  entryMethod: EntryMethodSchema,
  dataTier: DataTierSchema,
  holeScores: z.array(HoleScoreSchema).min(1),
  grossScore: z.number().int().positive().optional(),
  provenance: RoundProvenanceSchema.optional(),
});
export type NormalizedRound = z.infer<typeof NormalizedRoundSchema>;
