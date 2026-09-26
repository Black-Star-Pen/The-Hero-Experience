import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  drizzle as drizzlePostgres,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import {
  drizzle as drizzlePglite,
  type PgliteDatabase,
} from "drizzle-orm/pglite";
import pg from "pg";
import * as schema from "./schema.ts";

export type Schema = typeof schema;

/** Driver-agnostic handle used by the repositories. */
export type Database = PgDatabase<PgQueryResultHKT, Schema>;

export type DatabaseConnection =
  | {
      driver: "postgres";
      db: NodePgDatabase<Schema>;
      close: () => Promise<void>;
    }
  | {
      driver: "pglite";
      db: PgliteDatabase<Schema>;
      close: () => Promise<void>;
    };

export interface ConnectOptions {
  /** PostgreSQL connection string. When missing, the embedded PGlite database is used. */
  url?: string | undefined;
  /** PGlite data directory. When missing, the database only lives in memory (tests). */
  pgliteDataDir?: string | undefined;
}

const config = { schema, casing: "snake_case" } as const;

export async function connectDatabase({
  url,
  pgliteDataDir,
}: ConnectOptions): Promise<DatabaseConnection> {
  if (url) {
    const pool = new pg.Pool({ connectionString: url });
    return {
      driver: "postgres",
      db: drizzlePostgres({ client: pool, ...config }),
      close: () => pool.end(),
    };
  }

  if (pgliteDataDir) mkdirSync(pgliteDataDir, { recursive: true });
  const client = await PGlite.create(pgliteDataDir);
  return {
    driver: "pglite",
    db: drizzlePglite({ client, ...config }),
    close: () => client.close(),
  };
}
