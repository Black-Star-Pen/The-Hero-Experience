import type { HeroReviews, Review, ReviewInput } from "@hero-experience/shared";
import { HttpError } from "../../lib/http-error.ts";
import type { BookingsRepository } from "../bookings/bookings.repository.ts";
import type { HeroesRepository } from "../heroes/heroes.repository.ts";
import type { UserRow } from "../users/users.schema.ts";
import { toReview } from "./reviews.mapper.ts";
import type { ReviewsRepository } from "./reviews.repository.ts";

export function createReviewsService({
  reviews,
  heroes,
  bookings,
}: {
  reviews: ReviewsRepository;
  heroes: HeroesRepository;
  bookings: BookingsRepository;
}) {
  const ensureHeroExists = async (heroId: number) => {
    if (!(await heroes.findById(heroId))) {
      throw HttpError.notFound("Ce héros n'existe pas.");
    }
  };

  return {
    async list(
      heroId: number,
      { page, pageSize }: { page: number; pageSize: number },
      viewer: UserRow | undefined,
    ): Promise<HeroReviews> {
      await ensureHeroExists(heroId);
      const [{ rows, total }, summary, mine, canReview] = await Promise.all([
        reviews.listForHero(heroId, page, pageSize),
        reviews.summary(heroId),
        viewer ? reviews.findByUser(heroId, viewer.id) : undefined,
        viewer ? bookings.hasBookedHero(viewer.id, heroId) : false,
      ]);
      return {
        items: rows.map(toReview),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        summary,
        mine: mine ? toReview(mine) : null,
        canReview,
      };
    },

    /** Only customers who booked the hero can review them. */
    async saveMine(
      user: UserRow,
      heroId: number,
      input: ReviewInput,
    ): Promise<Review> {
      await ensureHeroExists(heroId);
      if (!(await bookings.hasBookedHero(user.id, heroId))) {
        throw new HttpError(
          403,
          "REVIEW_NOT_ALLOWED",
          "Seuls les clients ayant réservé ce héros peuvent laisser un avis.",
        );
      }
      const review = await reviews.upsert({
        heroId,
        userId: user.id,
        rating: input.rating,
        comment: input.comment,
      });
      return toReview({ review, author: user });
    },

    async deleteMine(user: UserRow, heroId: number): Promise<void> {
      if (!(await reviews.delete(heroId, user.id))) {
        throw HttpError.notFound("Vous n'avez pas encore donné votre avis.");
      }
    },
  };
}

export type ReviewsService = ReturnType<typeof createReviewsService>;
