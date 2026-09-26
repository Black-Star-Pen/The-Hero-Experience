import {
  heroListQuerySchema,
  type HeroListQuery,
} from "@hero-experience/shared";

const DEFAULTS = heroListQuerySchema.parse({});

/**
 * Reads the catalogue filters from the URL. Invalid parameters (a page
 * typed by hand, an unknown service…) are ignored instead of breaking the page.
 */
export function readCatalogParams(
  searchParams: URLSearchParams,
): HeroListQuery {
  const raw = Object.fromEntries(searchParams);
  const first = heroListQuerySchema.safeParse(raw);
  if (first.success) return first.data;

  const invalid = new Set(
    first.error.issues.map((issue) => String(issue.path[0])),
  );
  const valid = Object.fromEntries(
    Object.entries(raw).filter(([key]) => !invalid.has(key)),
  );
  const second = heroListQuerySchema.safeParse(valid);
  return second.success ? second.data : DEFAULTS;
}

/** Writes the filters to the URL, leaving out empty values and defaults. */
export function toSearchParams(query: Partial<HeroListQuery>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    if (DEFAULTS[key as keyof HeroListQuery] === value) continue;
    params.set(key, String(value));
  }
  return params;
}

/** True when the visitor narrowed the catalogue (the sort does not count). */
export const hasActiveFilters = (query: HeroListQuery): boolean =>
  Boolean(
    query.search ||
    query.service ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.availableOn,
  );
