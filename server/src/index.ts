import { todayIso } from "@hero-experience/shared";
import { createApp } from "./app.ts";
import { loadEnv } from "./config/env.ts";
import { loadEnvFile } from "./config/load-env-file.ts";
import { connectDatabase } from "./db/client.ts";
import { runMigrations } from "./db/migrations.ts";
import { createLogger } from "./lib/logger.ts";
import { seedDemoData } from "./modules/demo/demo-data.ts";
import { ensureHeroCatalog } from "./modules/heroes/catalog/import-catalog.ts";
import { createHeroesRepository } from "./modules/heroes/heroes.repository.ts";

loadEnvFile();
const env = loadEnv();
const logger = createLogger(env);

const connection = await connectDatabase({
  url: env.DATABASE_URL,
  pgliteDataDir: env.PGLITE_DATA_DIR,
});
logger.info({ driver: connection.driver }, "Database connected");
await runMigrations(connection);
await ensureHeroCatalog({
  repository: createHeroesRepository(connection.db),
  logger,
});
if (env.DEMO_DATA ?? env.NODE_ENV === "development") {
  await seedDemoData({ db: connection.db, logger, today: todayIso() });
}

const app = createApp({ env, logger, db: connection.db });

const server = app.listen(env.PORT, (error) => {
  if (error) {
    logger.fatal({ err: error }, "Unable to start the HTTP server");
    process.exit(1);
  }
  logger.info(`API ready on http://localhost:${env.PORT}`);
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Shutting down");
  // Force exit if open connections keep the server alive for too long
  setTimeout(() => process.exit(1), 10_000).unref();
  server.close();
  await connection.close();
  process.exit(0);
}

process.once("SIGINT", (signal) => void shutdown(signal));
process.once("SIGTERM", (signal) => void shutdown(signal));
