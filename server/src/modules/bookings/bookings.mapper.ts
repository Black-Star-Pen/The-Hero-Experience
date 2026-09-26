import { countDays, type Booking } from "@hero-experience/shared";
import type { BookingWithHero } from "./bookings.repository.ts";

export const toBooking = (
  { booking, hero }: BookingWithHero,
  today: string,
): Booking => ({
  id: booking.id,
  hero,
  service: booking.service,
  startDate: booking.startDate,
  endDate: booking.endDate,
  days: countDays(booking.startDate, booking.endDate),
  dailyRate: booking.dailyRate,
  totalPrice: booking.totalPrice,
  status: booking.status,
  address: booking.address,
  postalCode: booking.postalCode,
  city: booking.city,
  phone: booking.phone,
  notes: booking.notes,
  createdAt: booking.createdAt.toISOString(),
  cancelledAt: booking.cancelledAt?.toISOString() ?? null,
  cancellable: booking.status === "confirmed" && booking.startDate > today,
});
