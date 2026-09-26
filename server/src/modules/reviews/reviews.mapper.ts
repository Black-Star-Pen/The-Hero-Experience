import type { Review } from "@hero-experience/shared";
import type { ReviewWithAuthor } from "./reviews.repository.ts";

/** Only the first name and the initial of the author are made public. */
export const toReview = ({ review, author }: ReviewWithAuthor): Review => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  author: `${author.firstName} ${author.lastName.charAt(0).toUpperCase()}.`,
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString(),
});
