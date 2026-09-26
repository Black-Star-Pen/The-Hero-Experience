import { changePasswordSchema, profileSchema } from "@hero-experience/shared";
import type { RequestHandler } from "express";
import { parseInput } from "../../lib/validation.ts";
import { currentAuth } from "../auth/auth.middleware.ts";
import { toUser } from "./users.mapper.ts";
import type { UsersService } from "./users.service.ts";

export function createMeController(service: UsersService) {
  return {
    updateProfile: async (req, res) => {
      const { user } = currentAuth(res);
      const profile = parseInput(profileSchema.partial(), req.body);
      res.json({ user: toUser(await service.updateProfile(user.id, profile)) });
    },

    changePassword: async (req, res) => {
      const { user, session } = currentAuth(res);
      const input = parseInput(changePasswordSchema, req.body);
      await service.changePassword(user, session.id, input);
      res.status(204).end();
    },
  } satisfies Record<string, RequestHandler>;
}
