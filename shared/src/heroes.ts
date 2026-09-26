import { z } from "zod";
import { isoDateSchema } from "./fields.ts";
import type { RatingSummary } from "./reviews.ts";
import { serviceSlugSchema, type ServiceSlug } from "./services.ts";

export const HERO_SORTS = [
  "recommended",
  "name",
  "price-asc",
  "price-desc",
  "rating",
  "power",
] as const;
export type HeroSort = (typeof HERO_SORTS)[number];

export const HERO_PAGE_SIZE = 12;
export const HERO_MAX_PAGE_SIZE = 48;

/** Query string of GET /api/heroes. Empty parameters are ignored. */
export const heroListQuerySchema = z.preprocess(
  (input) =>
    input && typeof input === "object"
      ? Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== ""),
        )
      : input,
  z
    .object({
      search: z.string().trim().min(1).max(100).optional(),
      service: serviceSlugSchema.optional(),
      minPrice: z.coerce.number().int().min(0).optional(),
      maxPrice: z.coerce.number().int().min(0).optional(),
      /** Only heroes free on this day (YYYY-MM-DD). */
      availableOn: isoDateSchema.optional(),
      sort: z.enum(HERO_SORTS).default("recommended"),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(HERO_MAX_PAGE_SIZE)
        .default(HERO_PAGE_SIZE),
    })
    .refine(
      ({ minPrice, maxPrice }) =>
        minPrice === undefined ||
        maxPrice === undefined ||
        minPrice <= maxPrice,
      {
        message: "Le prix minimum doit être inférieur au prix maximum.",
        path: ["minPrice"],
      },
    ),
);
export type HeroListQuery = z.infer<typeof heroListQuerySchema>;

export const heroIdSchema = z.coerce.number().int().positive();

export type Alignment = "good" | "bad" | "neutral";

export interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

/** A hero as listed in the catalogue. */
export interface HeroSummary {
  id: number;
  name: string;
  fullName: string | null;
  publisher: string | null;
  imageUrl: string;
  /** Price of one day of service, in euros. */
  dailyRate: number;
  services: ServiceSlug[];
  rating: RatingSummary;
  /** First free day in the next 90 days (YYYY-MM-DD), null if fully booked. */
  nextAvailableDate: string | null;
}

/** Everything about one hero (GET /api/heroes/:id). */
export interface HeroDetail extends HeroSummary {
  alignment: Alignment | null;
  gender: string | null;
  race: string | null;
  heightCm: number | null;
  weightKg: number | null;
  occupation: string | null;
  base: string | null;
  placeOfBirth: string | null;
  firstAppearance: string | null;
  powerstats: Powerstats;
  images: { sm: string; md: string; lg: string };
}
