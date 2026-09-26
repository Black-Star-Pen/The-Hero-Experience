import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.ts";
import { createReviewsController } from "./reviews.controller.ts";
import type { ReviewsService } from "./reviews.service.ts";

/** /api/heroes/:heroId/reviews */
export function createReviewsRouter(service: ReviewsService): Router {
  const controller = createReviewsController(service);
  const router = Router({ mergeParams: true });

  router.get("/", controller.list);
  router.put("/mine", requireAuth, controller.saveMine);
  router.delete("/mine", requireAuth, controller.deleteMine);

  return router;
}
