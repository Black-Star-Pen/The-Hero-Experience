import {
  heroIdSchema,
  reviewInputSchema,
  reviewListQuerySchema,
} from "@hero-experience/shared";
import type { RequestHandler } from "express";
import { parseInput } from "../../lib/validation.ts";
import { currentAuth } from "../auth/auth.middleware.ts";
import type { ReviewsService } from "./reviews.service.ts";

export function createReviewsController(service: ReviewsService) {
  return {
    list: async (req, res) => {
      const heroId = parseInput(heroIdSchema, req.params.heroId);
      const query = parseInput(reviewListQuerySchema, req.query);
      res.json(await service.list(heroId, query, res.locals.auth?.user));
    },

    saveMine: async (req, res) => {
      const { user } = currentAuth(res);
      const heroId = parseInput(heroIdSchema, req.params.heroId);
      const input = parseInput(reviewInputSchema, req.body);
      res.json(await service.saveMine(user, heroId, input));
    },

    deleteMine: async (req, res) => {
      const { user } = currentAuth(res);
      const heroId = parseInput(heroIdSchema, req.params.heroId);
      await service.deleteMine(user, heroId);
      res.status(204).end();
    },
  } satisfies Record<string, RequestHandler>;
}
