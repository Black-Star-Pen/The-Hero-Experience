import { createApp } from "../../src/app.ts";
import { loadEnv, type Env } from "../../src/config/env.ts";
import { connectDatabase } from "../../src/db/client.ts";
import { runMigrations } from "../../src/db/migrations.ts";
import { createLogger } from "../../src/lib/logger.ts";

/** Builds the app on top of a fresh in-memory PostgreSQL database (PGlite). */
export async function createTestApp(overrides: Partial<Env> = {}) {
  const env: Env = {
    ...loadEnv({
      NODE_ENV: "test",
      API_RATE_LIMIT: "100000",
      AUTH_RATE_LIMIT: "100000",
    }),
    ...overrides,
  };
  const logger = createLogger({ NODE_ENV: "test", LOG_LEVEL: "silent" });
  const connection = await connectDatabase({});
  await runMigrations(connection);

  return {
    app: createApp({ env, logger, db: connection.db }),
    db: connection.db,
    close: () => connection.close(),
  };
}
