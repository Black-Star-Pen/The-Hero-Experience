import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.ts";
import { createBookingsController } from "./bookings.controller.ts";
import type { BookingsService } from "./bookings.service.ts";

/** /api/bookings: the signed-in customer's bookings. */
export function createBookingsRouter(service: BookingsService): Router {
  const controller = createBookingsController(service);
  const router = Router();

  router.use(requireAuth);
  router.get("/", controller.listMine);
  router.post("/", controller.create);
  router.post("/:id/cancel", controller.cancel);

  return router;
}

/** /api/heroes/:heroId/availability: public, only dates are exposed. */
export function createAvailabilityRouter(service: BookingsService): Router {
  const controller = createBookingsController(service);
  const router = Router({ mergeParams: true });

  router.get("/", controller.availability);

  return router;
}
