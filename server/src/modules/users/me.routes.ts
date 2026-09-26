import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.ts";
import { createMeController } from "./me.controller.ts";
import type { UsersService } from "./users.service.ts";

/** Routes of the signed-in customer's own account (/api/me). */
export function createMeRouter(service: UsersService): Router {
  const controller = createMeController(service);
  const router = Router();

  router.use(requireAuth);
  router.patch("/", controller.updateProfile);
  router.put("/password", controller.changePassword);

  return router;
}
