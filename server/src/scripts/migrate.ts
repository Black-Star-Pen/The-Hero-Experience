import { loadEnv } from "../config/env.ts";
import { loadEnvFile } from "../config/load-env-file.ts";
import { connectDatabase } from "../db/client.ts";
import { runMigrations } from "../db/migrations.ts";
import { createLogger } from "../lib/logger.ts";

loadEnvFile();
const env = loadEnv();
const logger = createLogger(env);
const connection = await connectDatabase({
  url: env.DATABASE_URL,
  pgliteDataDir: env.PGLITE_DATA_DIR,
});

try {
  await runMigrations(connection);
  logger.info({ driver: connection.driver }, "Database migrations applied");
} finally {
  await connection.close();
}
