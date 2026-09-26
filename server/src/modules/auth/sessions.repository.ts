import { and, eq, lte, ne } from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import { users, type UserRow } from "../users/users.schema.ts";
import { sessions, type SessionRow } from "./sessions.schema.ts";

export function createSessionsRepository(db: Database) {
  return {
    async create(session: Omit<SessionRow, "createdAt">): Promise<void> {
      await db.insert(sessions).values(session);
    },

    async findWithUser(
      id: string,
    ): Promise<{ session: SessionRow; user: UserRow } | undefined> {
      const [row] = await db
        .select({ session: sessions, user: users })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .where(eq(sessions.id, id));
      return row;
    },

    async updateExpiry(id: string, expiresAt: Date): Promise<void> {
      await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
    },

    async delete(id: string): Promise<void> {
      await db.delete(sessions).where(eq(sessions.id, id));
    },

    /** Signs the user out everywhere, except on the given session. */
    async deleteOthers(userId: number, keepId: string): Promise<void> {
      await db
        .delete(sessions)
        .where(and(eq(sessions.userId, userId), ne(sessions.id, keepId)));
    },

    async deleteExpired(now: Date): Promise<void> {
      await db.delete(sessions).where(lte(sessions.expiresAt, now));
    },
  };
}

export type SessionsRepository = ReturnType<typeof createSessionsRepository>;
