import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/users.schema.ts";

export const sessions = pgTable(
  "sessions",
  {
    /**
     * SHA-256 of the token stored in the cookie: a leak of this table
     * does not allow to hijack the sessions.
     */
    id: text().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.userId), index().on(table.expiresAt)],
);

export type SessionRow = typeof sessions.$inferSelect;
