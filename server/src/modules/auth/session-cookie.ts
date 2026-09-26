import type { CookieOptions, Response } from "express";
import type { Env } from "../../config/env.ts";

export interface SessionCookie {
  name: string;
  options: CookieOptions;
}

/**
 * HttpOnly (unreachable from JavaScript) and SameSite=Lax (not sent by
 * cross-site forms). In production the cookie is Secure and uses the
 * __Host- prefix, which forbids any Domain attribute.
 */
export function sessionCookie(env: Pick<Env, "NODE_ENV">): SessionCookie {
  const secure = env.NODE_ENV === "production";
  return {
    name: secure ? "__Host-session" : "session",
    options: { httpOnly: true, sameSite: "lax", secure, path: "/" },
  };
}

export function setSessionCookie(
  res: Response,
  cookie: SessionCookie,
  token: string,
  expiresAt: Date,
): void {
  res.cookie(cookie.name, token, { ...cookie.options, expires: expiresAt });
}

export function clearSessionCookie(res: Response, cookie: SessionCookie): void {
  res.clearCookie(cookie.name, cookie.options);
}
