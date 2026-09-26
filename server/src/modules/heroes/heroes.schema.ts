import type { Alignment, ServiceSlug } from "@hero-experience/shared";
import {
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const heroes = pgTable(
  "heroes",
  {
    /** Same id as in the SuperHero API, so imports are idempotent. */
    id: integer().primaryKey(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    fullName: text(),
    publisher: text(),
    alignment: text().$type<Alignment>(),
    gender: text(),
    race: text(),
    heightCm: integer(),
    weightKg: integer(),
    occupation: text(),
    base: text(),
    placeOfBirth: text(),
    firstAppearance: text(),
    intelligence: smallint().notNull(),
    strength: smallint().notNull(),
    speed: smallint().notNull(),
    durability: smallint().notNull(),
    power: smallint().notNull(),
    combat: smallint().notNull(),
    imageSm: text().notNull(),
    imageMd: text().notNull(),
    imageLg: text().notNull(),
    /** Price of one day of service, in euros. */
    dailyRate: smallint().notNull(),
    services: text().array().notNull().$type<ServiceSlug[]>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index().on(table.name),
    index().on(table.dailyRate),
    index().using("gin", table.services),
  ],
);

export type HeroRow = typeof heroes.$inferSelect;
export type NewHeroRow = typeof heroes.$inferInsert;
