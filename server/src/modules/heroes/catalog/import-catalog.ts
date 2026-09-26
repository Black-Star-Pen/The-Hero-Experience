import type { Logger } from "../../../lib/logger.ts";
import type { HeroesRepository } from "../heroes.repository.ts";
import { toHeroRow } from "./hero-catalog.ts";
import { fetchSuperheroes, type RawHero } from "./superhero-api.ts";

/** Inserts or refreshes the given heroes. Returns how many were imported. */
export async function importHeroes(
  repository: HeroesRepository,
  rawHeroes: RawHero[],
): Promise<number> {
  const rows = rawHeroes.map(toHeroRow);
  await repository.upsertMany(rows);
  return rows.length;
}

interface EnsureCatalogOptions {
  repository: HeroesRepository;
  logger: Logger;
  source?: () => Promise<RawHero[]>;
}

/**
 * Imports the catalogue on the very first start, so a fresh install has
 * heroes to show. A download failure is logged but does not stop the API.
 */
export async function ensureHeroCatalog({
  repository,
  logger,
  source = fetchSuperheroes,
}: EnsureCatalogOptions): Promise<void> {
  if ((await repository.count()) > 0) return;

  logger.info(
    "The hero catalogue is empty, importing it from the SuperHero API",
  );
  try {
    const imported = await importHeroes(repository, await source());
    logger.info({ imported }, "Hero catalogue imported");
  } catch (error) {
    logger.warn(
      { err: error },
      "Could not import the hero catalogue, run `npm run db:seed` once online",
    );
  }
}
