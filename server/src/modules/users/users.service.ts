import {
  DEMO_CREDENTIALS,
  type ChangePasswordInput,
  type ProfileInput,
} from "@hero-experience/shared";
import { HttpError } from "../../lib/http-error.ts";
import { hashPassword, verifyPassword } from "../../lib/password.ts";
import type { SessionService } from "../auth/session.service.ts";
import type { UsersRepository } from "./users.repository.ts";
import type { UserRow } from "./users.schema.ts";

/** The demo account is shared by every visitor: nobody may lock the others out. */
function ensureNotDemoAccount(user: UserRow): void {
  if (user.email === DEMO_CREDENTIALS.email) {
    throw new HttpError(
      403,
      "DEMO_ACCOUNT_READ_ONLY",
      "Le compte de démo ne peut pas être modifié : créez votre propre compte pour essayer.",
    );
  }
}

export function createUsersService({
  users,
  sessions,
}: {
  users: UsersRepository;
  sessions: SessionService;
}) {
  return {
    async updateProfile(
      user: UserRow,
      profile: Partial<ProfileInput>,
    ): Promise<UserRow> {
      ensureNotDemoAccount(user);
      const updated = await users.updateProfile(user.id, profile);
      if (!updated) throw HttpError.unauthorized();
      return updated;
    },

    /** Changes the password and signs the user out of their other devices. */
    async changePassword(
      user: UserRow,
      currentSessionId: string,
      input: ChangePasswordInput,
    ): Promise<void> {
      ensureNotDemoAccount(user);
      if (!(await verifyPassword(user.passwordHash, input.currentPassword))) {
        const message = "Le mot de passe actuel est incorrect.";
        throw new HttpError(400, "INVALID_PASSWORD", message, {
          formErrors: [],
          fieldErrors: { currentPassword: [message] },
        });
      }
      await users.updatePasswordHash(
        user.id,
        await hashPassword(input.newPassword),
      );
      await sessions.revokeOthers(user.id, currentSessionId);
    },
  };
}

export type UsersService = ReturnType<typeof createUsersService>;
