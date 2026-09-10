import { initialAccomplishments } from "@course-mastery/catalog";
import { createSeedClient } from "./client.js";

/**
 * Loads packages/catalog's proposed accomplishment definitions into
 * Supabase. Requires SEED_CATALOG_CONFIRM=yes as an explicit guard,
 * because that catalog is PROPOSED — pending founder sign-off against
 * ACCOMPLISHMENTS_PROPOSAL.md at the repo root — not because the code
 * can't run, but because seeding it is a decision, not a mechanical step.
 */
async function main() {
  if (process.env.SEED_CATALOG_CONFIRM !== "yes") {
    console.error(
      "Refusing to seed: the accomplishment catalog in packages/catalog is PROPOSED, not yet " +
        "signed off (see ACCOMPLISHMENTS_PROPOSAL.md). Set SEED_CATALOG_CONFIRM=yes once approved.",
    );
    process.exit(1);
  }

  const client = createSeedClient();
  const { error } = await client.from("accomplishment_definitions").upsert(
    initialAccomplishments.map((d) => ({
      slug: d.slug,
      version: d.version,
      family: d.family,
      tier: d.tier,
      name: d.name,
      description: d.description,
      mp_value: d.mpValue,
      params: d.params,
      active: d.active,
    })),
  );
  if (error) throw error;

  console.log(`Seeded ${initialAccomplishments.length} accomplishment definitions.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
