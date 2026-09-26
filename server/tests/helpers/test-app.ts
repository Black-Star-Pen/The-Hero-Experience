import request from "supertest";
import { expect } from "vitest";
import { z } from "zod";
import { createApp } from "../../src/app.ts";
import { loadEnv, type Env } from "../../src/config/env.ts";
import { connectDatabase } from "../../src/db/client.ts";
import { runMigrations } from "../../src/db/migrations.ts";
import type { Clock } from "../../src/lib/clock.ts";
import { createLogger } from "../../src/lib/logger.ts";
import { importHeroes } from "../../src/modules/heroes/catalog/import-catalog.ts";
import { rawHeroSchema } from "../../src/modules/heroes/catalog/superhero-api.ts";
import { createHeroesRepository } from "../../src/modules/heroes/heroes.repository.ts";
import { superheroes } from "../fixtures/superheroes.ts";

export interface TestAppOptions {
  /** Fixed current time, to test date rules. */
  clock?: Clock;
  /** Imports the 11 fixture heroes. */
  withHeroes?: boolean;
}

/** Builds the app on top of a fresh in-memory PostgreSQL database (PGlite). */
export async function createTestApp(
  overrides: Partial<Env> = {},
  { clock, withHeroes = false }: TestAppOptions = {},
) {
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
  if (withHeroes) {
    await importHeroes(
      createHeroesRepository(connection.db),
      z.array(rawHeroSchema).parse(superheroes),
    );
  }

  const app = createApp({ env, logger, db: connection.db, clock });
  let accounts = 0;

  return {
    app,
    db: connection.db,
    close: () => connection.close(),

    /** Registers a new customer and returns an agent carrying its session cookie. */
    async signUp(firstName = "Peter", lastName = "Parker") {
      accounts += 1;
      const agent = request.agent(app);
      const response = await agent.post("/api/auth/register").send({
        email: `customer${accounts}@example.com`,
        password: "with-great-power",
        firstName,
        lastName,
      });
      expect(response.status).toBe(201);
      return agent;
    },
  };
}

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;
