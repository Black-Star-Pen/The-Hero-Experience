import { z } from "zod";
import type { Paginated } from "./api.ts";

export const reviewInputSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "La note doit être comprise entre 1 et 5.")
    .max(5, "La note doit être comprise entre 1 et 5."),
  comment: z
    .string()
    .trim()
    .min(10, "Votre avis doit contenir au moins 10 caractères.")
    .max(1000, "Votre avis ne peut pas dépasser 1000 caractères."),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(5),
});

export interface Review {
  id: number;
  rating: number;
  comment: string;
  /** First name and initial of the author, e.g. "Peter P.". */
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummary {
  /** Rounded to one decimal, null when the hero has no review yet. */
  average: number | null;
  count: number;
}

/** GET /api/heroes/:id/reviews */
export interface HeroReviews extends Paginated<Review> {
  summary: RatingSummary;
  /** Review of the signed-in user, if any. */
  mine: Review | null;
  /** Only customers who booked the hero can review them. */
  canReview: boolean;
}
