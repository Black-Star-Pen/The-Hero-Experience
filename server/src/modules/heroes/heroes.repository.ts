import type { HeroListQuery } from "@hero-experience/shared";
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import { heroes, type HeroRow, type NewHeroRow } from "./heroes.schema.ts";

/** Escapes LIKE wildcards so a search for "100%" matches literally. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const totalPower = sql`(${heroes.intelligence} + ${heroes.strength} + ${heroes.speed} + ${heroes.durability} + ${heroes.power} + ${heroes.combat})`;

const ORDER_BY: Record<HeroListQuery["sort"], SQL[]> = {
  // Shuffled differently every day, but stable across pages within a day
  recommended: [sql`md5(${heroes.id}::text || current_date::text)`],
  name: [asc(heroes.name), asc(heroes.id)],
  "price-asc": [asc(heroes.dailyRate), asc(heroes.name), asc(heroes.id)],
  "price-desc": [desc(heroes.dailyRate), asc(heroes.name), asc(heroes.id)],
  power: [desc(totalPower), asc(heroes.name), asc(heroes.id)],
};

/** On re-import, every column takes the incoming value except the keys and timestamps. */
const refreshedColumns = Object.fromEntries(
  Object.keys(getTableColumns(heroes))
    .filter((key) => !["id", "createdAt", "updatedAt"].includes(key))
    .map((key) => [
      key,
      sql.raw(
        `excluded.${key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}`,
      ),
    ]),
);

export type HeroFilters = Pick<
  HeroListQuery,
  "search" | "service" | "minPrice" | "maxPrice"
>;

function whereClause({ search, service, minPrice, maxPrice }: HeroFilters) {
  const pattern = search && `%${escapeLike(search)}%`;
  return and(
    pattern
      ? or(ilike(heroes.name, pattern), ilike(heroes.fullName, pattern))
      : undefined,
    service ? arrayContains(heroes.services, [service]) : undefined,
    minPrice !== undefined ? gte(heroes.dailyRate, minPrice) : undefined,
    maxPrice !== undefined ? lte(heroes.dailyRate, maxPrice) : undefined,
  );
}

export function createHeroesRepository(db: Database) {
  return {
    async findPage(
      query: HeroListQuery,
    ): Promise<{ rows: HeroRow[]; total: number }> {
      const where = whereClause(query);
      const [rows, [totals]] = await Promise.all([
        db
          .select()
          .from(heroes)
          .where(where)
          .orderBy(...ORDER_BY[query.sort])
          .limit(query.pageSize)
          .offset((query.page - 1) * query.pageSize),
        db.select({ total: count() }).from(heroes).where(where),
      ]);
      return { rows, total: totals?.total ?? 0 };
    },

    async findById(id: number): Promise<HeroRow | undefined> {
      const [row] = await db.select().from(heroes).where(eq(heroes.id, id));
      return row;
    },

    async count(): Promise<number> {
      const [result] = await db.select({ total: count() }).from(heroes);
      return result?.total ?? 0;
    },

    /** Inserts new heroes and refreshes existing ones (idempotent import). */
    async upsertMany(rows: NewHeroRow[]): Promise<void> {
      if (rows.length === 0) return;
      await db
        .insert(heroes)
        .values(rows)
        .onConflictDoUpdate({
          target: heroes.id,
          set: { ...refreshedColumns, updatedAt: sql`now()` },
        });
    },
  };
}

export type HeroesRepository = ReturnType<typeof createHeroesRepository>;
