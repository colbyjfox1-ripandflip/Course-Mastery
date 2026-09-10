import { z } from "zod";

// Accomplishment / tier catalog types. Definitions are data rows with a
// stable slug + version; evaluator families are pure code. See
// PRODUCT_SPEC.md §5.

export const EvaluatorFamilySchema = z.enum([
  "hole_relative_to_par",
  "counts_within_round",
  "round_score_threshold",
  "nine_hole_threshold",
  "streak_within_round",
  "absence",
  "consistency_recent_rounds",
  "compression",
  "personal_best",
  "round_count_milestone",
]);
export type EvaluatorFamily = z.infer<typeof EvaluatorFamilySchema>;

export const MasteryTierSchema = z.enum([
  "familiarity",
  "competence",
  "command",
  "mastery",
  "open_ended",
]);
export type MasteryTier = z.infer<typeof MasteryTierSchema>;

export const AccomplishmentDefinitionSchema = z.object({
  slug: z.string().min(1),
  version: z.number().int().min(1),
  family: EvaluatorFamilySchema,
  tier: MasteryTierSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  mpValue: z.number().int().min(0),
  // Family-specific parameters; shape validated per-family inside
  // packages/engine, not here (keeps this schema stable as families grow).
  params: z.record(z.string(), z.unknown()),
  active: z.boolean().default(true),
});
export type AccomplishmentDefinition = z.infer<typeof AccomplishmentDefinitionSchema>;
