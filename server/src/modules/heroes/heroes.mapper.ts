import type { HeroDetail, HeroSummary } from "@hero-experience/shared";
import type { HeroRow } from "./heroes.schema.ts";

export const toHeroSummary = (row: HeroRow): HeroSummary => ({
  id: row.id,
  name: row.name,
  fullName: row.fullName,
  publisher: row.publisher,
  imageUrl: row.imageMd,
  dailyRate: row.dailyRate,
  services: row.services,
});

export const toHeroDetail = (row: HeroRow): HeroDetail => ({
  ...toHeroSummary(row),
  alignment: row.alignment,
  gender: row.gender,
  race: row.race,
  heightCm: row.heightCm,
  weightKg: row.weightKg,
  occupation: row.occupation,
  base: row.base,
  placeOfBirth: row.placeOfBirth,
  firstAppearance: row.firstAppearance,
  powerstats: {
    intelligence: row.intelligence,
    strength: row.strength,
    speed: row.speed,
    durability: row.durability,
    power: row.power,
    combat: row.combat,
  },
  images: { sm: row.imageSm, md: row.imageMd, lg: row.imageLg },
});
