import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { heroes } from "../heroes/heroes.schema.ts";
import { users } from "../users/users.schema.ts";

export const reviews = pgTable(
  "reviews",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    heroId: integer()
      .notNull()
      .references(() => heroes.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: smallint().notNull(),
    comment: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One review per customer and per hero (it can be edited)
    unique("reviews_hero_user_unique").on(table.heroId, table.userId),
    index().on(table.heroId, table.createdAt),
    check("reviews_rating_check", sql`${table.rating} between 1 and 5`),
  ],
);

export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;
