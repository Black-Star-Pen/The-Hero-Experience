import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  computeDailyRate,
  deriveServices,
  MIN_DAILY_RATE,
  parseHeightCm,
  parseWeightKg,
  toHeroRow,
} from "../../src/modules/heroes/catalog/hero-catalog.ts";
import { rawHeroSchema } from "../../src/modules/heroes/catalog/superhero-api.ts";
import { superheroes } from "../fixtures/superheroes.ts";

const raw = z.array(rawHeroSchema).parse(superheroes);
const rowOf = (id: number) => {
  const hero = raw.find((item) => item.id === id);
  if (!hero) throw new Error(`Fixture ${id} not found`);
  return toHeroRow(hero);
};

const stats = (overrides: Partial<Record<string, number>> = {}) => ({
  intelligence: 10,
  strength: 10,
  speed: 10,
  durability: 10,
  power: 10,
  combat: 10,
  ...overrides,
});

describe("measures", () => {
  it.each([
    [["6'2", "188 cm"], 188],
    [["50'", "15.2 meters"], 1520],
    [["-", "0 cm"], null],
    [["-", "61.0 kg"], null],
    [[], null],
  ])("parses height %j", (input, expected) => {
    expect(parseHeightCm(input)).toBe(expected);
  });

  it.each([
    [["210 lb", "95 kg"], 95],
    [["- lb", "2 tons"], 2000],
    [["- lb", "90,000 tons"], 90_000_000],
    [["- lb", "0 kg"], null],
  ])("parses weight %j", (input, expected) => {
    expect(parseWeightKg(input)).toBe(expected);
  });
});

describe("computeDailyRate", () => {
  it("adds strength and durability", () => {
    expect(computeDailyRate(stats({ strength: 26, durability: 50 }))).toBe(76);
  });

  it("never goes below the minimum rate", () => {
    expect(computeDailyRate(stats({ strength: 5, durability: 6 }))).toBe(
      MIN_DAILY_RATE,
    );
  });
});

describe("deriveServices", () => {
  it("reads the occupation", () => {
    expect(
      deriveServices({
        name: "Someone",
        occupation: "Freelance photographer, private investigator",
        powerstats: stats(),
      }),
    ).toEqual(["spectacle", "enquetes"]);
  });

  it("matches whole words, plurals and explicit prefixes", () => {
    const servicesOf = (occupation: string) =>
      deriveServices({
        name: "Someone",
        occupation,
        powerstats: stats({ combat: 20 }),
      });

    // "band" must not match "Bandit", nor "host" match "hostile"
    expect(servicesOf("Bandit, hostile laboratory assistant")).toEqual([
      "sport",
    ]);
    expect(servicesOf("Plays in two bands")).toEqual(["musique"]);
    expect(servicesOf("Paranormal investigator")).toEqual(["enquetes"]);
  });

  it("uses the hero name for sonic powers", () => {
    expect(
      deriveServices({
        name: "Black Canary",
        occupation: null,
        powerstats: stats(),
      }),
    ).toContain("musique");
  });

  it("uses the stats of powerful heroes", () => {
    expect(
      deriveServices({
        name: "Strongman",
        occupation: null,
        powerstats: stats({ strength: 95, durability: 90 }),
      }),
    ).toContain("demenagement");
  });

  it("falls back on the service of the best stat", () => {
    expect(
      deriveServices({
        name: "Nobody",
        occupation: null,
        powerstats: stats({ intelligence: 60 }),
      }),
    ).toEqual(["aide-aux-devoirs"]);
  });
});

describe("toHeroRow", () => {
  it("maps a complete entry", () => {
    expect(rowOf(70)).toMatchObject({
      id: 70,
      slug: "70-batman",
      name: "Batman",
      fullName: "Bruce Wayne",
      publisher: "DC Comics",
      alignment: "good",
      heightCm: 188,
      weightKg: 95,
      occupation: "Businessman",
      dailyRate: 76,
      services: ["aide-aux-devoirs"],
    });
  });

  it("turns the dataset placeholders into nulls", () => {
    expect(rowOf(5)).toMatchObject({
      name: "Abraxas",
      heightCm: null,
      weightKg: null,
      base: null,
    });
    expect(rowOf(43)).toMatchObject({ fullName: null, race: null });
    expect(rowOf(370)).toMatchObject({ name: "Joker", occupation: null });
  });

  it("caps stats that exceed 100", () => {
    expect(rowOf(43).combat).toBe(100);
  });
});
