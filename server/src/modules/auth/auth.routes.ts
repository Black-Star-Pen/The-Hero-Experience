import { Router, type RequestHandler } from "express";
import { createAuthController } from "./auth.controller.ts";
import type { AuthService } from "./auth.service.ts";
import type { SessionCookie } from "./session-cookie.ts";

export function createAuthRouter({
  auth,
  cookie,
  bruteForceLimiter,
}: {
  auth: AuthService;
  cookie: SessionCookie;
  /** Limits failed attempts on the credential endpoints. */
  bruteForceLimiter: RequestHandler;
}): Router {
  const controller = createAuthController(auth, cookie);
  const router = Router();

  router.get("/session", controller.session);
  router.post("/register", bruteForceLimiter, controller.register);
  router.post("/login", bruteForceLimiter, controller.login);
  router.post("/logout", controller.logout);

  return router;
}
