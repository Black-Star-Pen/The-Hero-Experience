import {
  loginSchema,
  registerSchema,
  type SessionResponse,
} from "@hero-experience/shared";
import type { RequestHandler } from "express";
import { parseInput } from "../../lib/validation.ts";
import { toUser } from "../users/users.mapper.ts";
import type { AuthService } from "./auth.service.ts";
import {
  clearSessionCookie,
  setSessionCookie,
  type SessionCookie,
} from "./session-cookie.ts";

export function createAuthController(auth: AuthService, cookie: SessionCookie) {
  return {
    session: (_req, res) => {
      const { auth: current } = res.locals;
      res.json({
        user: current ? toUser(current.user) : null,
      } satisfies SessionResponse);
    },

    register: async (req, res) => {
      const input = parseInput(registerSchema, req.body);
      const { user, session } = await auth.register(input);
      setSessionCookie(res, cookie, session.token, session.expiresAt);
      res.status(201).json({ user: toUser(user) });
    },

    login: async (req, res) => {
      const input = parseInput(loginSchema, req.body);
      const { user, session } = await auth.login(input);
      setSessionCookie(res, cookie, session.token, session.expiresAt);
      res.json({ user: toUser(user) });
    },

    logout: async (_req, res) => {
      if (res.locals.auth) await auth.logout(res.locals.auth.session.id);
      clearSessionCookie(res, cookie);
      res.status(204).end();
    },
  } satisfies Record<string, RequestHandler>;
}
