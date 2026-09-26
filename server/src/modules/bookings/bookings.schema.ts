import type { BookingStatus, ServiceSlug } from "@hero-experience/shared";
import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { heroes } from "../heroes/heroes.schema.ts";
import { users } from "../users/users.schema.ts";

export const bookings = pgTable(
  "bookings",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    heroId: integer()
      .notNull()
      .references(() => heroes.id, { onDelete: "restrict" }),
    service: text().notNull().$type<ServiceSlug>(),
    startDate: date({ mode: "string" }).notNull(),
    endDate: date({ mode: "string" }).notNull(),
    /** Snapshot of the hero's rate when the booking was made. */
    dailyRate: smallint().notNull(),
    totalPrice: integer().notNull(),
    status: text().$type<BookingStatus>().notNull().default("confirmed"),
    address: text().notNull(),
    postalCode: text().notNull(),
    city: text().notNull(),
    phone: text().notNull(),
    notes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    index().on(table.userId),
    index().on(table.heroId, table.startDate),
    check("bookings_dates_check", sql`${table.endDate} >= ${table.startDate}`),
  ],
);

export type BookingRow = typeof bookings.$inferSelect;
export type NewBookingRow = typeof bookings.$inferInsert;
