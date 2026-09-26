import { z } from "zod";
import { countDays } from "./dates.ts";
import {
  isoDateSchema,
  optionalText,
  phoneSchema,
  postalCodeSchema,
  requiredText,
} from "./fields.ts";
import { serviceSlugSchema, type ServiceSlug } from "./services.ts";

export const BOOKING_MAX_DAYS = 14;

export type BookingStatus = "confirmed" | "cancelled";

/** Body of POST /api/bookings. The price is always computed by the server. */
export const bookingInputSchema = z
  .object({
    heroId: z.number().int().positive(),
    service: serviceSlugSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    address: requiredText("L'adresse", 200),
    postalCode: postalCodeSchema,
    city: requiredText("La ville", 100),
    phone: phoneSchema,
    notes: optionalText(
      z
        .string()
        .trim()
        .max(500, "Le message ne peut pas dépasser 500 caractères.")
        .nullable(),
    ).optional(),
  })
  .refine(({ startDate, endDate }) => endDate >= startDate, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["endDate"],
  })
  .refine(
    ({ startDate, endDate }) =>
      endDate < startDate || countDays(startDate, endDate) <= BOOKING_MAX_DAYS,
    {
      message: `Une réservation ne peut pas dépasser ${BOOKING_MAX_DAYS} jours.`,
      path: ["endDate"],
    },
  );
export type BookingInput = z.infer<typeof bookingInputSchema>;

export interface Booking {
  id: number;
  hero: { id: number; name: string; imageUrl: string };
  service: ServiceSlug;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  totalPrice: number;
  status: BookingStatus;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  cancelledAt: string | null;
  /** True until the service starts: the booking can still be cancelled. */
  cancellable: boolean;
}

export interface DateRange {
  start: string;
  end: string;
}

/** Query string of GET /api/heroes/:id/availability (defaults: the next 90 days). */
export const availabilityQuerySchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
});

export interface HeroAvailability {
  from: string;
  to: string;
  /** Periods already booked, both ends included. */
  bookedRanges: DateRange[];
}
