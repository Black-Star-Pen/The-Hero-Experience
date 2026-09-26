import { heroIdSchema, heroListQuerySchema } from "@hero-experience/shared";
import type { RequestHandler } from "express";
import { parseInput } from "../../lib/validation.ts";
import type { HeroesService } from "./heroes.service.ts";

export function createHeroesController(service: HeroesService) {
  return {
    list: async (req, res) => {
      const query = parseInput(heroListQuerySchema, req.query);
      res.json(await service.list(query));
    },

    getById: async (req, res) => {
      const id = parseInput(heroIdSchema, req.params.id);
      res.json(await service.getById(id));
    },
  } satisfies Record<string, RequestHandler>;
}
