import type {
  HeroDetail,
  HeroSummary,
  Paginated,
} from "@hero-experience/shared";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createLogger } from "../../src/lib/logger.ts";
import {
  ensureHeroCatalog,
  importHeroes,
} from "../../src/modules/heroes/catalog/import-catalog.ts";
import { rawHeroSchema } from "../../src/modules/heroes/catalog/superhero-api.ts";
import { createHeroesRepository } from "../../src/modules/heroes/heroes.repository.ts";
import { superheroes } from "../fixtures/superheroes.ts";
import { createTestApp } from "../helpers/test-app.ts";

const raw = z.array(rawHeroSchema).parse(superheroes);
const logger = createLogger({ NODE_ENV: "test", LOG_LEVEL: "silent" });

describe("heroes API", () => {
  let testApp: Awaited<ReturnType<typeof createTestApp>>;

  const list = async (query = "") => {
    const response = await request(testApp.app).get(`/api/heroes${query}`);
    expect(response.status).toBe(200);
    return response.body as Paginated<HeroSummary>;
  };
  const names = (page: Paginated<HeroSummary>) =>
    page.items.map((hero) => hero.name);

  beforeAll(async () => {
    testApp = await createTestApp();
    await importHeroes(createHeroesRepository(testApp.db), raw);
  });
  afterAll(() => testApp.close());

  it("lists heroes with pagination metadata", async () => {
    const page = await list();

    expect(page).toMatchObject({
      page: 1,
      pageSize: 12,
      total: 11,
      totalPages: 1,
    });
    expect(page.items).toHaveLength(11);
    expect(page.items[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      fullName: expect.toBeOneOf([expect.any(String), null]),
      publisher: expect.toBeOneOf([expect.any(String), null]),
      imageUrl: expect.stringMatching(/^https:\/\/cdn\.jsdelivr\.net\//),
      dailyRate: expect.any(Number),
      services: expect.any(Array),
    });
  });

  it("paginates", async () => {
    const page = await list("?pageSize=4&page=3&sort=name");

    expect(page).toMatchObject({ page: 3, pageSize: 4, totalPages: 3 });
    expect(names(page)).toEqual(["Spider-Man", "Superman", "Wonder Woman"]);
  });

  it("searches by name or full name, case-insensitively", async () => {
    expect(names(await list("?search=batman&sort=name"))).toEqual([
      "Batman",
      "Batman",
    ]);
    expect(names(await list("?search=WAYNE"))).toEqual(["Batman"]);
  });

  it("treats LIKE wildcards literally", async () => {
    expect((await list("?search=%25")).total).toBe(0);
  });

  it("filters by service", async () => {
    expect(names(await list("?service=musique"))).toEqual(["Dazzler"]);
    expect(names(await list("?service=enquetes&sort=name"))).toEqual([
      "Black Widow",
      "Hulk",
      "Superman",
    ]);
  });

  it("filters by price range", async () => {
    const cheap = await list("?maxPrice=70&sort=price-asc");
    expect(names(cheap)).toEqual(["Black Widow", "Dazzler", "Joker"]);

    const premium = await list("?minPrice=150&maxPrice=199");
    expect(names(premium).sort()).toEqual(["Abraxas", "Ares"]);
  });

  it("sorts by price and by power", async () => {
    const byPrice = await list("?sort=price-desc");
    expect(names(byPrice).slice(0, 4)).toEqual([
      "Hulk",
      "Superman",
      "Wonder Woman",
      "Abraxas",
    ]);

    const byPower = await list("?sort=power");
    expect(byPower.items[0]?.name).toBe("Superman");
  });

  it("returns the same recommended order on every call", async () => {
    expect(names(await list())).toEqual(names(await list()));
  });

  it("ignores empty query parameters", async () => {
    expect((await list("?search=&service=&minPrice=")).total).toBe(11);
  });

  it.each([
    ["?pageSize=1000", "pageSize"],
    ["?page=0", "page"],
    ["?service=astronaut", "service"],
    ["?minPrice=100&maxPrice=50", "minPrice"],
    ["?sort=random", "sort"],
  ])("rejects invalid query %s", async (query, field) => {
    const response = await request(testApp.app).get(`/api/heroes${query}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        details: { fieldErrors: { [field]: expect.any(Array) } },
      },
    });
  });

  it("returns one hero with all its details", async () => {
    const response = await request(testApp.app).get("/api/heroes/620");

    expect(response.status).toBe(200);
    const hero = response.body as HeroDetail;
    expect(hero).toMatchObject({
      id: 620,
      name: "Spider-Man",
      fullName: "Peter Parker",
      dailyRate: 130,
      heightCm: 178,
      powerstats: { intelligence: 90, strength: 55, combat: 85 },
      services: ["sport", "aide-aux-devoirs", "travaux", "spectacle"],
    });
    expect(hero.images.lg).toMatch(/\/lg\/620-spider-man\.jpg$/);
  });

  it("answers 404 for an unknown hero and 400 for an invalid id", async () => {
    const missing = await request(testApp.app).get("/api/heroes/99999");
    expect(missing.status).toBe(404);
    expect(missing.body).toMatchObject({ error: { code: "NOT_FOUND" } });

    const invalid = await request(testApp.app).get("/api/heroes/batman");
    expect(invalid.status).toBe(400);
  });
});

describe("hero catalogue import", () => {
  let testApp: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    testApp = await createTestApp();
  });
  afterAll(() => testApp.close());

  it("imports on first start only", async () => {
    const repository = createHeroesRepository(testApp.db);
    const source = vi.fn(() => Promise.resolve(raw));

    await ensureHeroCatalog({ repository, logger, source });
    await ensureHeroCatalog({ repository, logger, source });

    expect(source).toHaveBeenCalledOnce();
    expect(await repository.count()).toBe(11);
  });

  it("is idempotent and refreshes existing heroes", async () => {
    const repository = createHeroesRepository(testApp.db);
    const renamed = raw.map((hero) =>
      hero.id === 70 ? { ...hero, name: "The Batman" } : hero,
    );

    await importHeroes(repository, renamed);

    expect(await repository.count()).toBe(11);
    expect((await repository.findById(70))?.name).toBe("The Batman");
  });

  it("keeps the API running when the download fails", async () => {
    const empty = await createTestApp();
    const source = vi.fn(() => Promise.reject(new Error("offline")));

    await expect(
      ensureHeroCatalog({
        repository: createHeroesRepository(empty.db),
        logger,
        source,
      }),
    ).resolves.toBeUndefined();
    await empty.close();
  });
});
