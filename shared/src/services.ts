import { z } from "zod";

/** Services a hero can be booked for. The slug is used in URLs and in the API. */
export const SERVICES = [
  {
    slug: "demenagement",
    label: "Déménagement",
    description: "Des bras d'acier pour vos cartons, et même pour le piano.",
  },
  {
    slug: "sport",
    label: "Sport",
    description: "Un coaching sportif intense avec les meilleurs combattants.",
  },
  {
    slug: "aide-aux-devoirs",
    label: "Aide aux devoirs",
    description:
      "Des génies patients pour les maths, les sciences et le reste.",
  },
  {
    slug: "travaux",
    label: "Travaux",
    description: "Bricolage, électricité, construction : du travail de pro.",
  },
  {
    slug: "evenements",
    label: "Événements",
    description: "Anniversaires, mariages, fêtes : une animation inoubliable.",
  },
  {
    slug: "spectacle",
    label: "Spectacle",
    description: "Acteurs et artistes pour vos tournages et vos scènes.",
  },
  {
    slug: "enquetes",
    label: "Enquêtes",
    description:
      "Filatures, recherches et mystères résolus en toute discrétion.",
  },
  {
    slug: "musique",
    label: "Cours de musique",
    description:
      "Apprenez à chanter ou à jouer avec des musiciens hors normes.",
  },
] as const;

export type Service = (typeof SERVICES)[number];
export type ServiceSlug = Service["slug"];

export const serviceSlugSchema = z.enum(
  SERVICES.map((service) => service.slug) as [ServiceSlug, ...ServiceSlug[]],
);

export function getService(slug: ServiceSlug): Service {
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return service;
}
