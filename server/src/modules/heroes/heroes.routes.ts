import { Router } from "express";
import { createHeroesController } from "./heroes.controller.ts";
import type { HeroesService } from "./heroes.service.ts";

export function createHeroesRouter(service: HeroesService): Router {
  const controller = createHeroesController(service);
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.getById);

  return router;
}
