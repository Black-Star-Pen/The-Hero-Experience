import type { DateRange } from "@hero-experience/shared";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import { heroes } from "../heroes/heroes.schema.ts";
import {
  bookings,
  type BookingRow,
  type NewBookingRow,
} from "./bookings.schema.ts";

export interface BookingWithHero {
  booking: BookingRow;
  hero: { id: number; name: string; imageUrl: string };
}

const withHero = {
  booking: bookings,
  hero: { id: heroes.id, name: heroes.name, imageUrl: heroes.imageMd },
};

const overlaps = (heroId: number, start: string, end: string) =>
  and(
    eq(bookings.heroId, heroId),
    eq(bookings.status, "confirmed"),
    lte(bookings.startDate, end),
    gte(bookings.endDate, start),
  );

export function createBookingsRepository(db: Database) {
  return {
    /**
     * Inserts the booking unless the hero already has a confirmed booking on
     * one of the days. Returns null in that case.
     */
    insertIfAvailable(row: NewBookingRow): Promise<BookingRow | null> {
      return db.transaction(async (tx) => {
        // Locking the hero row serializes concurrent bookings of the same hero,
        // so two customers cannot book the same days at the same time.
        await tx
          .select({ id: heroes.id })
          .from(heroes)
          .where(eq(heroes.id, row.heroId))
          .for("update");
        const [conflict] = await tx
          .select({ id: bookings.id })
          .from(bookings)
          .where(overlaps(row.heroId, row.startDate, row.endDate))
          .limit(1);
        if (conflict) return null;

        const [created] = await tx.insert(bookings).values(row).returning();
        return created ?? null;
      });
    },

    listForUser(userId: number): Promise<BookingWithHero[]> {
      return db
        .select(withHero)
        .from(bookings)
        .innerJoin(heroes, eq(heroes.id, bookings.heroId))
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.startDate), desc(bookings.id));
    },

    async findForUser(
      id: number,
      userId: number,
    ): Promise<BookingWithHero | undefined> {
      const [row] = await db
        .select(withHero)
        .from(bookings)
        .innerJoin(heroes, eq(heroes.id, bookings.heroId))
        .where(and(eq(bookings.id, id), eq(bookings.userId, userId)));
      return row;
    },

    async cancel(id: number): Promise<BookingRow | undefined> {
      const [row] = await db
        .update(bookings)
        .set({ status: "cancelled", cancelledAt: sql`now()` })
        .where(and(eq(bookings.id, id), eq(bookings.status, "confirmed")))
        .returning();
      return row;
    },

    /** Confirmed bookings of a hero overlapping [from, to]. */
    bookedRanges(
      heroId: number,
      from: string,
      to: string,
    ): Promise<DateRange[]> {
      return db
        .select({ start: bookings.startDate, end: bookings.endDate })
        .from(bookings)
        .where(overlaps(heroId, from, to))
        .orderBy(asc(bookings.startDate));
    },

    async hasBookedHero(userId: number, heroId: number): Promise<boolean> {
      const [row] = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, userId),
            eq(bookings.heroId, heroId),
            eq(bookings.status, "confirmed"),
          ),
        )
        .limit(1);
      return row !== undefined;
    },
  };
}

export type BookingsRepository = ReturnType<typeof createBookingsRepository>;
