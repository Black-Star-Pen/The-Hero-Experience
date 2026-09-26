import { describe, expect, it } from "vitest";
import {
  hasActiveFilters,
  readCatalogParams,
  toSearchParams,
} from "./catalog-params.ts";

describe("catalogue URL parameters", () => {
  it("reads valid filters", () => {
    const query = readCatalogParams(
      new URLSearchParams(
        "search=bat&service=sport&minPrice=50&page=2&sort=rating",
      ),
    );

    expect(query).toMatchObject({
      search: "bat",
      service: "sport",
      minPrice: 50,
      page: 2,
      sort: "rating",
    });
  });

  it("ignores invalid values instead of failing", () => {
    const query = readCatalogParams(
      new URLSearchParams("service=astronaut&page=-3&search=hulk"),
    );

    expect(query).toMatchObject({ search: "hulk", page: 1 });
    expect(query.service).toBeUndefined();
  });

  it("writes only the values that differ from the defaults", () => {
    const params = toSearchParams({
      search: "bat",
      service: undefined,
      sort: "recommended",
      page: 1,
      pageSize: 12,
      maxPrice: 100,
    });

    expect(params.toString()).toBe("search=bat&maxPrice=100");
  });

  it("tells whether the visitor filtered the catalogue", () => {
    expect(
      hasActiveFilters(readCatalogParams(new URLSearchParams("sort=name"))),
    ).toBe(false);
    expect(
      hasActiveFilters(readCatalogParams(new URLSearchParams("minPrice=0"))),
    ).toBe(true);
  });
});
