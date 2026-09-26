import type {
  ChangePasswordInput,
  ProfileInput,
} from "@hero-experience/shared";
import { HttpError } from "../../lib/http-error.ts";
import { hashPassword, verifyPassword } from "../../lib/password.ts";
import type { SessionService } from "../auth/session.service.ts";
import type { UsersRepository } from "./users.repository.ts";
import type { UserRow } from "./users.schema.ts";

export function createUsersService({
  users,
  sessions,
}: {
  users: UsersRepository;
  sessions: SessionService;
}) {
  return {
    async updateProfile(
      userId: number,
      profile: Partial<ProfileInput>,
    ): Promise<UserRow> {
      const user = await users.updateProfile(userId, profile);
      if (!user) throw HttpError.unauthorized();
      return user;
    },

    /** Changes the password and signs the user out of their other devices. */
    async changePassword(
      user: UserRow,
      currentSessionId: string,
      input: ChangePasswordInput,
    ): Promise<void> {
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
