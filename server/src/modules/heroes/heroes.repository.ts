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
  notExists,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import { bookings } from "../bookings/bookings.schema.ts";
import { reviews } from "../reviews/reviews.schema.ts";
import { heroes, type HeroRow, type NewHeroRow } from "./heroes.schema.ts";

/** How far ahead the next availability is looked for. */
export const AVAILABILITY_HORIZON_DAYS = 90;

/** A hero with the figures computed from reviews and bookings. */
export interface HeroWithStats {
  hero: HeroRow;
  ratingAverage: number | null;
  ratingCount: number;
  nextAvailableDate: string | null;
}

/** Escapes LIKE wildcards so a search for "100%" matches literally. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const totalPower = sql`(${heroes.intelligence} + ${heroes.strength} + ${heroes.speed} + ${heroes.durability} + ${heroes.power} + ${heroes.combat})`;

// Correlations go through eq(): Drizzle strips table names from top-level
// columns of a single-table selection, which would make "id" ambiguous.
const reviewsOfHero = eq(reviews.heroId, heroes.id);

const ratingAverage = sql<
  number | null
>`(select round(avg(${reviews.rating}), 1)::float8 from ${reviews} where ${reviewsOfHero})`;

const ratingCount = sql<number>`(select count(*)::int from ${reviews} where ${reviewsOfHero})`;

/** A confirmed booking of the current hero covering the given day. */
const bookedOn = (day: SQL | string) =>
  and(
    eq(bookings.heroId, heroes.id),
    eq(bookings.status, "confirmed"),
    lte(bookings.startDate, day),
    gte(bookings.endDate, day),
  );

const nextAvailableDate = (today: string) => sql<string | null>`(
  select to_char(day, 'YYYY-MM-DD')
  from generate_series(${today}::date, ${today}::date + ${AVAILABILITY_HORIZON_DAYS}::int, interval '1 day') as day
  where not exists (select 1 from ${bookings} where ${bookedOn(sql`day::date`)})
  order by day
  limit 1
)`;

const orderBy = (sort: HeroListQuery["sort"], today: string): SQL[] => {
  switch (sort) {
    case "recommended":
      // Shuffled differently every day, but stable across pages within a day
      return [sql`md5(${heroes.id}::text || ${today})`];
    case "name":
      return [asc(heroes.name), asc(heroes.id)];
    case "price-asc":
      return [asc(heroes.dailyRate), asc(heroes.name), asc(heroes.id)];
    case "price-desc":
      return [desc(heroes.dailyRate), asc(heroes.name), asc(heroes.id)];
    case "rating":
      return [
        sql`${ratingAverage} desc nulls last`,
        desc(ratingCount),
        asc(heroes.name),
      ];
    case "power":
      return [desc(totalPower), asc(heroes.name), asc(heroes.id)];
  }
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

export function createHeroesRepository(db: Database) {
  const withStats = (today: string) => ({
    hero: heroes,
    ratingAverage,
    ratingCount,
    nextAvailableDate: nextAvailableDate(today),
  });

  const whereClause = ({
    search,
    service,
    minPrice,
    maxPrice,
    availableOn,
  }: HeroListQuery) => {
    const pattern = search && `%${escapeLike(search)}%`;
    return and(
      pattern
        ? or(ilike(heroes.name, pattern), ilike(heroes.fullName, pattern))
        : undefined,
      service ? arrayContains(heroes.services, [service]) : undefined,
      minPrice !== undefined ? gte(heroes.dailyRate, minPrice) : undefined,
      maxPrice !== undefined ? lte(heroes.dailyRate, maxPrice) : undefined,
      availableOn
        ? notExists(
            db
              .select({ id: bookings.id })
              .from(bookings)
              .where(bookedOn(availableOn)),
          )
        : undefined,
    );
  };

  return {
    async findPage(
      query: HeroListQuery,
      today: string,
    ): Promise<{ rows: HeroWithStats[]; total: number }> {
      const where = whereClause(query);
      const [rows, [totals]] = await Promise.all([
        db
          .select(withStats(today))
          .from(heroes)
          .where(where)
          .orderBy(...orderBy(query.sort, today))
          .limit(query.pageSize)
          .offset((query.page - 1) * query.pageSize),
        db.select({ total: count() }).from(heroes).where(where),
      ]);
      return { rows, total: totals?.total ?? 0 };
    },

    async findWithStats(
      id: number,
      today: string,
    ): Promise<HeroWithStats | undefined> {
      const [row] = await db
        .select(withStats(today))
        .from(heroes)
        .where(eq(heroes.id, id));
      return row;
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
