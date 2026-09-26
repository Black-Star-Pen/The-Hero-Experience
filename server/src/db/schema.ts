/**
 * Database schema entry point, used by the Drizzle client and by drizzle-kit
 * to generate SQL migrations. Each feature module owns its tables and
 * re-exports them from here.
 */
export * from "../modules/auth/sessions.schema.ts";
export * from "../modules/heroes/heroes.schema.ts";
export * from "../modules/users/users.schema.ts";
