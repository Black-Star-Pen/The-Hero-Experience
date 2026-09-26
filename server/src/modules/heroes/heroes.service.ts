import type {
  HeroDetail,
  HeroListQuery,
  HeroSummary,
  Paginated,
} from "@hero-experience/shared";
import { HttpError } from "../../lib/http-error.ts";
import { toHeroDetail, toHeroSummary } from "./heroes.mapper.ts";
import type { HeroesRepository } from "./heroes.repository.ts";

export function createHeroesService(repository: HeroesRepository) {
  return {
    async list(query: HeroListQuery): Promise<Paginated<HeroSummary>> {
      const { rows, total } = await repository.findPage(query);
      return {
        items: rows.map(toHeroSummary),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      };
    },

    async getById(id: number): Promise<HeroDetail> {
      const row = await repository.findById(id);
      if (!row) throw HttpError.notFound("Ce héros n'existe pas.");
      return toHeroDetail(row);
    },
  };
}

export type HeroesService = ReturnType<typeof createHeroesService>;
