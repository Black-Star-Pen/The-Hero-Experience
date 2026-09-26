import { todayIso } from "@hero-experience/shared";
import { loadEnv } from "../config/env.ts";
import { loadEnvFile } from "../config/load-env-file.ts";
import { connectDatabase } from "../db/client.ts";
import { runMigrations } from "../db/migrations.ts";
import { createLogger } from "../lib/logger.ts";
import { seedDemoData } from "../modules/demo/demo-data.ts";
import { importHeroes } from "../modules/heroes/catalog/import-catalog.ts";
import { fetchSuperheroes } from "../modules/heroes/catalog/superhero-api.ts";
import { createHeroesRepository } from "../modules/heroes/heroes.repository.ts";

// Imports (or refreshes) the hero catalogue, then adds the demo data if missing
loadEnvFile();
const env = loadEnv();
const logger = createLogger(env);
const connection = await connectDatabase({
  url: env.DATABASE_URL,
  pgliteDataDir: env.PGLITE_DATA_DIR,
});

try {
  await runMigrations(connection);
  const imported = await importHeroes(
    createHeroesRepository(connection.db),
    await fetchSuperheroes(),
  );
  logger.info({ imported }, "Hero catalogue imported or refreshed");
  await seedDemoData({ db: connection.db, logger, today: todayIso() });
} finally {
  await connection.close();
}
