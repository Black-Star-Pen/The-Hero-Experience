import { and, count, desc, eq, sql } from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import { users } from "../users/users.schema.ts";
import {
  reviews,
  type NewReviewRow,
  type ReviewRow,
} from "./reviews.schema.ts";

export interface ReviewWithAuthor {
  review: ReviewRow;
  author: { firstName: string; lastName: string };
}

const withAuthor = {
  review: reviews,
  author: { firstName: users.firstName, lastName: users.lastName },
};

export function createReviewsRepository(db: Database) {
  return {
    async listForHero(
      heroId: number,
      page: number,
      pageSize: number,
    ): Promise<{ rows: ReviewWithAuthor[]; total: number }> {
      const where = eq(reviews.heroId, heroId);
      const [rows, [totals]] = await Promise.all([
        db
          .select(withAuthor)
          .from(reviews)
          .innerJoin(users, eq(users.id, reviews.userId))
          .where(where)
          .orderBy(desc(reviews.createdAt), desc(reviews.id))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        db.select({ total: count() }).from(reviews).where(where),
      ]);
      return { rows, total: totals?.total ?? 0 };
    },

    async summary(
      heroId: number,
    ): Promise<{ average: number | null; count: number }> {
      const [row] = await db
        .select({
          average: sql<number | null>`round(avg(${reviews.rating}), 1)::float8`,
          count: sql<number>`count(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.heroId, heroId));
      return row ?? { average: null, count: 0 };
    },

    async findByUser(
      heroId: number,
      userId: number,
    ): Promise<ReviewWithAuthor | undefined> {
      const [row] = await db
        .select(withAuthor)
        .from(reviews)
        .innerJoin(users, eq(users.id, reviews.userId))
        .where(and(eq(reviews.heroId, heroId), eq(reviews.userId, userId)));
      return row;
    },

    /** Creates the customer's review of the hero, or replaces it. */
    async upsert(review: NewReviewRow): Promise<ReviewRow> {
      const [row] = await db
        .insert(reviews)
        .values(review)
        .onConflictDoUpdate({
          target: [reviews.heroId, reviews.userId],
          set: {
            rating: review.rating,
            comment: review.comment,
            updatedAt: sql`now()`,
          },
        })
        .returning();
      if (!row) throw new Error("The review upsert returned no row");
      return row;
    },

    async delete(heroId: number, userId: number): Promise<boolean> {
      const deleted = await db
        .delete(reviews)
        .where(and(eq(reviews.heroId, heroId), eq(reviews.userId, userId)))
        .returning({ id: reviews.id });
      return deleted.length > 0;
    },
  };
}

export type ReviewsRepository = ReturnType<typeof createReviewsRepository>;
