import type { RequestHandler, Response } from "express";
import { HttpError } from "../../lib/http-error.ts";
import type { SessionService } from "./session.service.ts";
import {
  clearSessionCookie,
  setSessionCookie,
  type SessionCookie,
} from "./session-cookie.ts";

/** Resolves the session cookie into `res.locals.auth` (left undefined for visitors). */
export function authenticate(
  sessions: SessionService,
  cookie: SessionCookie,
): RequestHandler {
  return async (req, res, next) => {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const token = cookies?.[cookie.name];
    if (typeof token === "string" && token !== "") {
      const result = await sessions.validate(token);
      if (result) {
        res.locals.auth = { user: result.user, session: result.session };
        if (result.renewed) {
          setSessionCookie(res, cookie, token, result.session.expiresAt);
        }
      } else {
        clearSessionCookie(res, cookie);
      }
    }
    next();
  };
}

export const requireAuth: RequestHandler = (_req, res, next) => {
  if (!res.locals.auth) throw HttpError.unauthorized();
  next();
};

/** The signed-in user of a route protected by requireAuth. */
export function currentAuth(res: Response) {
  const { auth } = res.locals;
  if (!auth) throw HttpError.unauthorized();
  return auth;
}
