import type { HeroDetail, HeroSummary } from "@hero-experience/shared";
import type { HeroWithStats } from "./heroes.repository.ts";

export const toHeroSummary = ({
  hero,
  ratingAverage,
  ratingCount,
  nextAvailableDate,
}: HeroWithStats): HeroSummary => ({
  id: hero.id,
  name: hero.name,
  fullName: hero.fullName,
  publisher: hero.publisher,
  imageUrl: hero.imageMd,
  dailyRate: hero.dailyRate,
  services: hero.services,
  rating: { average: ratingAverage, count: ratingCount },
  nextAvailableDate,
});

export const toHeroDetail = (row: HeroWithStats): HeroDetail => {
  const { hero } = row;
  return {
    ...toHeroSummary(row),
    alignment: hero.alignment,
    gender: hero.gender,
    race: hero.race,
    heightCm: hero.heightCm,
    weightKg: hero.weightKg,
    occupation: hero.occupation,
    base: hero.base,
    placeOfBirth: hero.placeOfBirth,
    firstAppearance: hero.firstAppearance,
    powerstats: {
      intelligence: hero.intelligence,
      strength: hero.strength,
      speed: hero.speed,
      durability: hero.durability,
      power: hero.power,
      combat: hero.combat,
    },
    images: { sm: hero.imageSm, md: hero.imageMd, lg: hero.imageLg },
  };
};
