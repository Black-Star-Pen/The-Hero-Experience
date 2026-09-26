import {
  addDays,
  countDays,
  todayIso,
  type Booking,
  type BookingInput,
  type HeroAvailability,
} from "@hero-experience/shared";
import type { Clock } from "../../lib/clock.ts";
import { HttpError } from "../../lib/http-error.ts";
import {
  AVAILABILITY_HORIZON_DAYS,
  type HeroesRepository,
} from "../heroes/heroes.repository.ts";
import { toBooking } from "./bookings.mapper.ts";
import type { BookingsRepository } from "./bookings.repository.ts";

const fieldError = (field: string, message: string) =>
  HttpError.badRequest(message, {
    formErrors: [],
    fieldErrors: { [field]: [message] },
  });

export function createBookingsService({
  bookings,
  heroes,
  clock,
}: {
  bookings: BookingsRepository;
  heroes: HeroesRepository;
  clock: Clock;
}) {
  const today = () => todayIso(clock());

  return {
    async create(userId: number, input: BookingInput): Promise<Booking> {
      if (input.startDate < today()) {
        throw fieldError(
          "startDate",
          "La réservation doit commencer aujourd'hui ou plus tard.",
        );
      }
      const hero = await heroes.findById(input.heroId);
      if (!hero) throw HttpError.notFound("Ce héros n'existe pas.");
      if (!hero.services.includes(input.service)) {
        throw fieldError("service", "Ce héros ne propose pas ce service.");
      }

      // The price is computed here, never trusted from the client
      const days = countDays(input.startDate, input.endDate);
      const booking = await bookings.insertIfAvailable({
        userId,
        heroId: hero.id,
        service: input.service,
        startDate: input.startDate,
        endDate: input.endDate,
        dailyRate: hero.dailyRate,
        totalPrice: days * hero.dailyRate,
        address: input.address,
        postalCode: input.postalCode,
        city: input.city,
        phone: input.phone,
        notes: input.notes ?? null,
      });
      if (!booking) {
        throw HttpError.conflict(
          `${hero.name} est déjà réservé sur une partie de ces dates.`,
          "HERO_UNAVAILABLE",
        );
      }
      return toBooking(
        {
          booking,
          hero: { id: hero.id, name: hero.name, imageUrl: hero.imageMd },
        },
        today(),
      );
    },

    async listMine(userId: number): Promise<Booking[]> {
      const rows = await bookings.listForUser(userId);
      return rows.map((row) => toBooking(row, today()));
    },

    async cancel(userId: number, bookingId: number): Promise<Booking> {
      const found = await bookings.findForUser(bookingId, userId);
      if (!found) throw HttpError.notFound("Réservation introuvable.");
      if (
        found.booking.status !== "confirmed" ||
        found.booking.startDate <= today()
      ) {
        throw HttpError.conflict(
          "Cette réservation ne peut plus être annulée.",
          "BOOKING_NOT_CANCELLABLE",
        );
      }
      const cancelled = await bookings.cancel(bookingId);
      return toBooking(
        { booking: cancelled ?? found.booking, hero: found.hero },
        today(),
      );
    },

    async availability(
      heroId: number,
      range: { from?: string | undefined; to?: string | undefined },
    ): Promise<HeroAvailability> {
      if (!(await heroes.findById(heroId))) {
        throw HttpError.notFound("Ce héros n'existe pas.");
      }
      const from = range.from ?? today();
      const to = range.to ?? addDays(from, AVAILABILITY_HORIZON_DAYS);
      if (to < from || countDays(from, to) > 366) {
        throw fieldError("to", "La période demandée est invalide.");
      }
      return {
        from,
        to,
        bookedRanges: await bookings.bookedRanges(heroId, from, to),
      };
    },
  };
}

export type BookingsService = ReturnType<typeof createBookingsService>;
