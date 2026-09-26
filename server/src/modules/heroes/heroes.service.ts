import {
  todayIso,
  type HeroDetail,
  type HeroListQuery,
  type HeroSummary,
  type Paginated,
} from "@hero-experience/shared";
import type { Clock } from "../../lib/clock.ts";
import { HttpError } from "../../lib/http-error.ts";
import { toHeroDetail, toHeroSummary } from "./heroes.mapper.ts";
import type { HeroesRepository } from "./heroes.repository.ts";

export function createHeroesService(
  repository: HeroesRepository,
  clock: Clock,
) {
  return {
    async list(query: HeroListQuery): Promise<Paginated<HeroSummary>> {
      const { rows, total } = await repository.findPage(
        query,
        todayIso(clock()),
      );
      return {
        items: rows.map(toHeroSummary),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      };
    },

    async getById(id: number): Promise<HeroDetail> {
      const row = await repository.findWithStats(id, todayIso(clock()));
      if (!row) throw HttpError.notFound("Ce héros n'existe pas.");
      return toHeroDetail(row);
    },
  };
}

export type HeroesService = ReturnType<typeof createHeroesService>;
