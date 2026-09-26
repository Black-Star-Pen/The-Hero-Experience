import type {
  Alignment,
  Powerstats,
  ServiceSlug,
} from "@hero-experience/shared";
import type { NewHeroRow } from "../heroes.schema.ts";
import type { RawHero } from "./superhero-api.ts";

export const MIN_DAILY_RATE = 30;

/** Placeholder values used by the dataset for "unknown". */
const clean = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return !trimmed || trimmed === "-" || trimmed === "null" ? null : trimmed;
};

const parseMeasure = (
  value: string | undefined,
  units: Record<string, number>,
): number | null => {
  const match = /^([\d.,]+)\s*([a-z]+)$/i.exec(value?.trim() ?? "");
  const factor = match?.[2] ? units[match[2].toLowerCase()] : undefined;
  if (!match?.[1] || factor === undefined) return null;
  const measure = Math.round(Number(match[1].replace(/,/g, "")) * factor);
  return measure > 0 ? measure : null;
};

/** "178 cm" or "15.2 meters" → centimeters. Unknown or zero values → null. */
export const parseHeightCm = (height: string[]): number | null =>
  parseMeasure(height[1], { cm: 1, meters: 100 });

/** "77 kg" or "2 tons" → kilograms. Unknown or zero values → null. */
export const parseWeightKg = (weight: string[]): number | null =>
  parseMeasure(weight[1], { kg: 1, tons: 1000 });

const parseAlignment = (value: string): Alignment | null =>
  value === "good" || value === "bad" || value === "neutral" ? value : null;

/**
 * Daily rate in euros. Historical rule of the project (strength + durability),
 * with a floor so that no hero is almost free.
 */
export const computeDailyRate = (stats: Powerstats): number =>
  Math.max(MIN_DAILY_RATE, stats.strength + stats.durability);

interface ServiceRule {
  /**
   * Words looked up in the hero's occupation. Whole words (plural allowed),
   * or prefixes when they end with "*": "investigat*" matches "investigator".
   */
  keywords: string[];
  /** Same, looked up in the hero's name (sonic powers → music…). */
  names?: string[];
  /** Heroes whose stats make them a natural fit. */
  qualifies?: (stats: Powerstats) => boolean;
}

const SERVICE_RULES: Record<ServiceSlug, ServiceRule> = {
  demenagement: {
    keywords: ["titan", "destroyer", "laborer", "labourer", "worker", "mover"],
    qualifies: (s) => s.strength >= 80 && s.durability >= 60,
  },
  sport: {
    keywords: [
      "boxer",
      "ballerina",
      "fighter",
      "judo*",
      "athlete",
      "wrestler",
      "martial",
      "gymnast",
      "coach",
      "soldier",
      "mercenar*",
    ],
    qualifies: (s) => s.combat >= 85 && s.speed >= 35,
  },
  "aide-aux-devoirs": {
    keywords: [
      "professor",
      "student",
      "teacher",
      "scientist",
      "physicist",
      "chemist",
      "biochemist",
      "genius",
      "scholar",
      "research*",
    ],
    qualifies: (s) => s.intelligence >= 90,
  },
  travaux: {
    keywords: [
      "engineer",
      "electronic*",
      "architect",
      "construct*",
      "mechanic",
      "inventor",
      "technician",
      "builder",
      "blacksmith",
      "industrialist",
    ],
    qualifies: (s) => s.intelligence >= 75 && s.strength >= 50,
  },
  evenements: {
    keywords: [
      "musician",
      "florist",
      "magician",
      "singer",
      "entertainer",
      "dancer",
      "clown",
      "circus",
      "performer",
      "showman",
      "host",
    ],
    qualifies: (s) => s.power >= 90,
  },
  spectacle: {
    keywords: [
      "actor",
      "actress",
      "artist",
      "model",
      "stunt*",
      "film*",
      "movie",
      "television",
      "celebrit*",
      "photographer",
      "circus",
      "acrobat",
      "dancer",
      "magician",
      "performer",
      "special effects",
    ],
  },
  enquetes: {
    keywords: [
      "investigat*",
      "detective",
      "tracker",
      "spy",
      "journalist",
      "reporter",
      "police",
      "agent",
      "vigilante",
      "bounty hunter",
      "private eye",
    ],
  },
  musique: {
    keywords: [
      "musician",
      "singer",
      "guitarist",
      "drummer",
      "composer",
      "band",
    ],
    names: ["banshee", "canary", "dazzler", "siren", "songbird"],
  },
};

const wordPattern = (words: string[] = []) => {
  if (words.length === 0) return null;
  const alternatives = words.map((word) =>
    word.endsWith("*") ? `${word.slice(0, -1)}\\w*` : `${word}(?:s|es)?`,
  );
  return new RegExp(`\\b(?:${alternatives.join("|")})\\b`, "i");
};

const patterns = Object.entries(SERVICE_RULES).map(([slug, rule]) => ({
  slug: slug as ServiceSlug,
  occupation: wordPattern(rule.keywords),
  name: wordPattern(rule.names),
  qualifies: rule.qualifies,
}));

/** When nothing matches, a hero offers the service of their best stat. */
const SERVICE_BY_STAT: Record<keyof Powerstats, ServiceSlug> = {
  intelligence: "aide-aux-devoirs",
  strength: "demenagement",
  durability: "travaux",
  combat: "sport",
  speed: "sport",
  power: "evenements",
};

interface ServiceProfile {
  name: string;
  occupation: string | null;
  powerstats: Powerstats;
}

/** Services a hero is offered for, from their occupation, name and stats. */
export function deriveServices({
  name,
  occupation,
  powerstats,
}: ServiceProfile): ServiceSlug[] {
  const services = patterns
    .filter(
      (rule) =>
        (occupation !== null && rule.occupation?.test(occupation)) ||
        rule.name?.test(name) ||
        rule.qualifies?.(powerstats),
    )
    .map((rule) => rule.slug);
  if (services.length > 0) return services;

  const [bestStat] = Object.entries(powerstats).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  );
  return [SERVICE_BY_STAT[bestStat as keyof Powerstats]];
}

/** Maps a SuperHero API entry to a row of the heroes table. */
export function toHeroRow(hero: RawHero): NewHeroRow {
  const occupation = clean(hero.work.occupation);
  return {
    id: hero.id,
    slug: hero.slug,
    name: hero.name.trim(),
    fullName: clean(hero.biography.fullName),
    publisher: clean(hero.biography.publisher),
    alignment: parseAlignment(hero.biography.alignment),
    gender: clean(hero.appearance.gender),
    race: clean(hero.appearance.race),
    heightCm: parseHeightCm(hero.appearance.height),
    weightKg: parseWeightKg(hero.appearance.weight),
    occupation,
    base: clean(hero.work.base),
    placeOfBirth: clean(hero.biography.placeOfBirth),
    firstAppearance: clean(hero.biography.firstAppearance),
    ...hero.powerstats,
    imageSm: hero.images.sm,
    imageMd: hero.images.md,
    imageLg: hero.images.lg,
    dailyRate: computeDailyRate(hero.powerstats),
    services: deriveServices({
      name: hero.name,
      occupation,
      powerstats: hero.powerstats,
    }),
  };
}
