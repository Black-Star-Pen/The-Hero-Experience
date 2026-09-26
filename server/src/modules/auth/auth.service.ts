import type { LoginInput, RegisterInput } from "@hero-experience/shared";
import { HttpError } from "../../lib/http-error.ts";
import {
  hashPassword,
  verifyDummyPassword,
  verifyPassword,
} from "../../lib/password.ts";
import type { UsersRepository } from "../users/users.repository.ts";
import type { SessionService } from "./session.service.ts";

export function createAuthService({
  users,
  sessions,
}: {
  users: UsersRepository;
  sessions: SessionService;
}) {
  return {
    async register(input: RegisterInput) {
      const user = await users.create({
        email: input.email,
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
      });
      if (!user) {
        throw HttpError.conflict(
          "Un compte existe déjà avec cette adresse e-mail.",
          "EMAIL_TAKEN",
        );
      }
      return { user, session: await sessions.create(user.id) };
    },

    async login(input: LoginInput) {
      const user = await users.findByEmail(input.email);
      const valid = user
        ? await verifyPassword(user.passwordHash, input.password)
        : await verifyDummyPassword(input.password);
      if (!user || !valid) {
        // Same answer whether the e-mail exists or not
        throw new HttpError(
          401,
          "INVALID_CREDENTIALS",
          "Adresse e-mail ou mot de passe incorrect.",
        );
      }
      await sessions.purgeExpired();
      return { user, session: await sessions.create(user.id) };
    },

    logout: (sessionId: string) => sessions.revoke(sessionId),
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
