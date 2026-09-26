import type { Review, ReviewInput } from "@hero-experience/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api.ts";
import { heroKeys } from "../heroes/api.ts";

/** A review changes the list of reviews and the ratings of the catalogue. */
function useReviewsChanged() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: heroKeys.all });
}

export function useSaveReview(heroId: number) {
  const onChanged = useReviewsChanged();
  return useMutation({
    mutationFn: (input: ReviewInput) =>
      api<Review>(`/heroes/${heroId}/reviews/mine`, {
        method: "PUT",
        body: input,
      }),
    onSuccess: onChanged,
  });
}

export function useDeleteReview(heroId: number) {
  const onChanged = useReviewsChanged();
  return useMutation({
    mutationFn: () =>
      api<void>(`/heroes/${heroId}/reviews/mine`, { method: "DELETE" }),
    onSuccess: onChanged,
  });
}
