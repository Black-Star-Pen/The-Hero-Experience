import { z } from "zod";

/** Version pinned on purpose: the dataset never changes under our feet. */
export const SUPERHERO_API_URL =
  "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json";

// Stats are on a 0–100 scale, but a couple of entries go slightly above (Ares: 101)
const stat = z
  .number()
  .int()
  .min(0)
  .transform((value) => Math.min(value, 100));

/** Shape of one hero in the SuperHero API (only the fields we use). */
export const rawHeroSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  powerstats: z.object({
    intelligence: stat,
    strength: stat,
    speed: stat,
    durability: stat,
    power: stat,
    combat: stat,
  }),
  appearance: z.object({
    gender: z.string(),
    race: z.string().nullable(),
    height: z.array(z.string()),
    weight: z.array(z.string()),
  }),
  biography: z.object({
    fullName: z.string(),
    placeOfBirth: z.string(),
    firstAppearance: z.string(),
    publisher: z.string().nullable(),
    alignment: z.string(),
  }),
  work: z.object({
    occupation: z.string(),
    base: z.string(),
  }),
  images: z.object({
    sm: z.url(),
    md: z.url(),
    lg: z.url(),
  }),
});

export type RawHero = z.infer<typeof rawHeroSchema>;

/** Downloads and validates the whole SuperHero API dataset. */
export async function fetchSuperheroes(
  url: string = SUPERHERO_API_URL,
): Promise<RawHero[]> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    throw new Error(`SuperHero API answered ${response.status} for ${url}`);
  }
  return z.array(rawHeroSchema).parse(await response.json());
}
