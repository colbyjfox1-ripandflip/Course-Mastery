// @course-mastery/catalog
//
// Typed access to accomplishment and tier definitions. In production these
// are rows in Postgres (PRODUCT_SPEC.md §5); this package provides the
// types (re-exported from @course-mastery/schema) and, for tests/tools,
// the local proposed definition set — see initial-accomplishments.ts for
// its approval status.

export { initialAccomplishments } from "./initial-accomplishments.js";
