import type { ProfileInput } from "@hero-experience/shared";
import { eq, sql } from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import { users, type NewUserRow, type UserRow } from "./users.schema.ts";

export function createUsersRepository(db: Database) {
  return {
    async findById(id: number): Promise<UserRow | undefined> {
      const [row] = await db.select().from(users).where(eq(users.id, id));
      return row;
    },

    async findByEmail(email: string): Promise<UserRow | undefined> {
      const [row] = await db.select().from(users).where(eq(users.email, email));
      return row;
    },

    /** Returns undefined when the e-mail is already taken. */
    async create(user: NewUserRow): Promise<UserRow | undefined> {
      const [row] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing({ target: users.email })
        .returning();
      return row;
    },

    async updateProfile(
      id: number,
      profile: Partial<ProfileInput>,
    ): Promise<UserRow | undefined> {
      const [row] = await db
        .update(users)
        .set({ ...profile, updatedAt: sql`now()` })
        .where(eq(users.id, id))
        .returning();
      return row;
    },

    async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
      await db
        .update(users)
        .set({ passwordHash, updatedAt: sql`now()` })
        .where(eq(users.id, id));
    },
  };
}

export type UsersRepository = ReturnType<typeof createUsersRepository>;
