import {
  availabilityQuerySchema,
  bookingInputSchema,
  heroIdSchema,
} from "@hero-experience/shared";
import type { RequestHandler } from "express";
import { z } from "zod";
import { parseInput } from "../../lib/validation.ts";
import { currentAuth } from "../auth/auth.middleware.ts";
import type { BookingsService } from "./bookings.service.ts";

const bookingIdSchema = z.coerce.number().int().positive();

export function createBookingsController(service: BookingsService) {
  return {
    create: async (req, res) => {
      const { user } = currentAuth(res);
      const input = parseInput(bookingInputSchema, req.body);
      res.status(201).json(await service.create(user.id, input));
    },

    listMine: async (_req, res) => {
      const { user } = currentAuth(res);
      res.json(await service.listMine(user.id));
    },

    cancel: async (req, res) => {
      const { user } = currentAuth(res);
      const id = parseInput(bookingIdSchema, req.params.id);
      res.json(await service.cancel(user.id, id));
    },

    availability: async (req, res) => {
      const heroId = parseInput(heroIdSchema, req.params.heroId);
      const range = parseInput(availabilityQuerySchema, req.query);
      res.json(await service.availability(heroId, range));
    },
  } satisfies Record<string, RequestHandler>;
}
