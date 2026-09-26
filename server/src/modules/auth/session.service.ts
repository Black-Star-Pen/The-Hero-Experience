import { createHash, randomBytes } from "node:crypto";
import type { UserRow } from "../users/users.schema.ts";
import type { SessionRow } from "./sessions.schema.ts";
import type { SessionsRepository } from "./sessions.repository.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
export const SESSION_DURATION_MS = 30 * DAY_MS;
/** Sessions used during their second half are extended (sliding expiration). */
export const SESSION_RENEWAL_THRESHOLD_MS = 15 * DAY_MS;

/** 256 bits of randomness, sent to the browser only. */
export const generateSessionToken = (): string =>
  randomBytes(32).toString("base64url");

/** The database only stores this hash of the token. */
export const hashSessionToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export interface ValidatedSession {
  session: SessionRow;
  user: UserRow;
  /** True when the expiration was pushed back and the cookie must be refreshed. */
  renewed: boolean;
}

export function createSessionService(
  repository: SessionsRepository,
  now: () => Date = () => new Date(),
) {
  return {
    async create(userId: number): Promise<{ token: string; expiresAt: Date }> {
      const token = generateSessionToken();
      const expiresAt = new Date(now().getTime() + SESSION_DURATION_MS);
      await repository.create({
        id: hashSessionToken(token),
        userId,
        expiresAt,
      });
      return { token, expiresAt };
    },

    async validate(token: string): Promise<ValidatedSession | null> {
      const id = hashSessionToken(token);
      const found = await repository.findWithUser(id);
      if (!found) return null;

      const current = now().getTime();
      const remaining = found.session.expiresAt.getTime() - current;
      if (remaining <= 0) {
        await repository.delete(id);
        return null;
      }
      if (remaining < SESSION_RENEWAL_THRESHOLD_MS) {
        const expiresAt = new Date(current + SESSION_DURATION_MS);
        await repository.updateExpiry(id, expiresAt);
        return {
          user: found.user,
          session: { ...found.session, expiresAt },
          renewed: true,
        };
      }
      return { ...found, renewed: false };
    },

    revoke: (sessionId: string) => repository.delete(sessionId),

    revokeOthers: (userId: number, keepSessionId: string) =>
      repository.deleteOthers(userId, keepSessionId),

    purgeExpired: () => repository.deleteExpired(now()),
  };
}

export type SessionService = ReturnType<typeof createSessionService>;
