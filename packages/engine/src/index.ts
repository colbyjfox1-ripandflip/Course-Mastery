// @course-mastery/engine
//
// The pure Mastery evaluation engine. Zero runtime dependency on Supabase,
// Postgres, or the network — see ARCHITECTURE.md §6.

export { evaluate } from "./engine.js";
export * from "./types.js";
export * from "./round-stats.js";
export { evaluatorRegistry } from "./evaluators/index.js";
