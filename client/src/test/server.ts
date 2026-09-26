import type { HeroSummary, Paginated } from "@hero-experience/shared";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  hulk,
  spiderMan,
  spiderManAvailability,
  spiderManReviews,
} from "./fixtures.ts";

const heroes: HeroSummary[] = [spiderMan, hulk];

/** Fake API used by the component tests; each test can override a handler. */
export const server = setupServer(
  http.get("*/api/heroes", ({ request }) => {
    const params = new URL(request.url).searchParams;
    const service = params.get("service");
    const search = params.get("search")?.toLowerCase();
    const items = heroes.filter(
      (hero) =>
        (!service ||
          hero.services.includes(service as HeroSummary["services"][number])) &&
        (!search || hero.name.toLowerCase().includes(search)),
    );
    return HttpResponse.json({
      items,
      page: Number(params.get("page") ?? 1),
      pageSize: 12,
      total: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    } satisfies Paginated<HeroSummary>);
  }),
  http.get("*/api/heroes/620", () => HttpResponse.json(spiderMan)),
  http.get("*/api/heroes/620/availability", () =>
    HttpResponse.json(spiderManAvailability),
  ),
  http.get("*/api/heroes/620/reviews", () =>
    HttpResponse.json(spiderManReviews),
  ),
  http.get("*/api/heroes/:id", () =>
    HttpResponse.json(
      { error: { code: "NOT_FOUND", message: "Ce héros n'existe pas." } },
      { status: 404 },
    ),
  ),
);
