import type { Booking, BookingInput } from "@hero-experience/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api.ts";
import { heroKeys } from "../heroes/api.ts";

export const bookingKeys = { all: ["bookings"] as const };

export const useMyBookings = () =>
  useQuery({
    queryKey: bookingKeys.all,
    queryFn: ({ signal }) => api<Booking[]>("/bookings", { signal }),
  });

/** A booking changes the availability shown everywhere in the catalogue. */
function useBookingsChanged() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
      queryClient.invalidateQueries({ queryKey: heroKeys.all }),
    ]);
}

export function useCreateBooking() {
  const onChanged = useBookingsChanged();
  return useMutation({
    mutationFn: (input: BookingInput) =>
      api<Booking>("/bookings", { method: "POST", body: input }),
    onSuccess: onChanged,
  });
}

export function useCancelBooking() {
  const onChanged = useBookingsChanged();
  return useMutation({
    mutationFn: (id: number) =>
      api<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
    onSuccess: onChanged,
  });
}
