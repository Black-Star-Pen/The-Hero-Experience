import type {
  HeroAvailability,
  HeroDetail,
  HeroListQuery,
  HeroReviews,
  HeroSummary,
  Paginated,
} from "@hero-experience/shared";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { api } from "../../lib/api.ts";

export type HeroListParams = Partial<HeroListQuery>;

export const REVIEWS_PAGE_SIZE = 5;

/** Query keys, shared by the queries and by the invalidations after a mutation. */
export const heroKeys = {
  all: ["heroes"] as const,
  list: (params: HeroListParams) => ["heroes", "list", params] as const,
  detail: (id: number) => ["heroes", "detail", id] as const,
  availability: (id: number) => ["heroes", "availability", id] as const,
  reviews: (id: number) => ["heroes", "reviews", id] as const,
};

export const useHeroes = (params: HeroListParams) =>
  useQuery({
    queryKey: heroKeys.list(params),
    queryFn: ({ signal }) =>
      api<Paginated<HeroSummary>>("/heroes", { query: params, signal }),
    // Keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

export const useHero = (id: number, { enabled = true } = {}) =>
  useQuery({
    queryKey: heroKeys.detail(id),
    queryFn: ({ signal }) => api<HeroDetail>(`/heroes/${id}`, { signal }),
    enabled,
  });

export const useHeroAvailability = (id: number) =>
  useQuery({
    queryKey: heroKeys.availability(id),
    queryFn: ({ signal }) =>
      api<HeroAvailability>(`/heroes/${id}/availability`, { signal }),
  });

export const useHeroReviews = (id: number) =>
  useInfiniteQuery({
    queryKey: heroKeys.reviews(id),
    queryFn: ({ pageParam, signal }) =>
      api<HeroReviews>(`/heroes/${id}/reviews`, {
        query: { page: pageParam, pageSize: REVIEWS_PAGE_SIZE },
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
