import { z } from "zod";

/** Mandatory free text, trimmed. */
export const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} est obligatoire.`)
    .max(max, `${label} ne peut pas dépasser ${max} caractères.`);

/** Optional form field: an empty value becomes null. */
export const optionalText = <T extends z.ZodType<string | null>>(schema: T) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    schema,
  );

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 .()-]{6,20}$/, "Numéro de téléphone invalide.");

export const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres.");

/** Calendar date, YYYY-MM-DD. */
export const isoDateSchema = z.iso.date("Date invalide.");
