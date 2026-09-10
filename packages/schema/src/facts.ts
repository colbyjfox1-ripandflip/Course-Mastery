import { z } from "zod";

// Immutable fact schemas: unlock events and the MP ledger. Never edited in
// place — corrections are new rows (reversals). See ARCHITECTURE.md §3, §7.

export const UnlockEventSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  courseSlug: z.string().min(1),
  definitionSlug: z.string().min(1),
  definitionVersion: z.number().int().min(1),
  roundId: z.string().uuid(),
  // Tee the round was played from — preserved even though the
  // accomplishment itself isn't tee-scoped (PRODUCT_SPEC.md §8).
  teeId: z.string().min(1),
  // Family-specific evidence (values compared, holes involved) — kept for
  // future rarity analysis and player-facing "why did this unlock" copy.
  evidence: z.record(z.string(), z.unknown()),
  engineVersion: z.string().min(1),
  catalogVersion: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type UnlockEvent = z.infer<typeof UnlockEventSchema>;

export const MpLedgerSourceTypeSchema = z.enum([
  "unlock_event",
  "reversal",
  "manual_adjustment",
]);
export type MpLedgerSourceType = z.infer<typeof MpLedgerSourceTypeSchema>;

export const MpLedgerEntrySchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  // Nullable: MP is course-scoped today (Course MP), but the ledger is
  // shaped to support Season MP / Career MP projections later without a
  // schema change (PRODUCT_SPEC.md §3).
  courseSlug: z.string().min(1).nullable(),
  // Signed. A reversal is a negative row referencing the original via
  // sourceId, never a deletion/edit of the original row.
  amount: z.number().int(),
  sourceType: MpLedgerSourceTypeSchema,
  sourceId: z.string().uuid().nullable(),
  engineVersion: z.string().min(1),
  catalogVersion: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type MpLedgerEntry = z.infer<typeof MpLedgerEntrySchema>;
