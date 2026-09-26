import { z } from "zod";
import {
  optionalText,
  phoneSchema,
  postalCodeSchema,
  requiredText,
} from "./fields.ts";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Trimmed and lower-cased, so that e-mail uniqueness is case-insensitive. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "L'adresse e-mail est trop longue.")
  .pipe(z.email("Adresse e-mail invalide."));

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Le mot de passe ne peut pas dépasser ${PASSWORD_MAX_LENGTH} caractères.`,
  );

const requiredName = (label: string) => requiredText(label, 50);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: requiredName("Le prénom"),
  lastName: requiredName("Le nom"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire.")
    .max(PASSWORD_MAX_LENGTH),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  firstName: requiredName("Le prénom"),
  lastName: requiredName("Le nom"),
  phone: optionalText(phoneSchema.nullable()),
  address: optionalText(
    z.string().trim().max(200, "L'adresse est trop longue.").nullable(),
  ),
  postalCode: optionalText(postalCodeSchema.nullable()),
  city: optionalText(
    z.string().trim().max(100, "Le nom de la ville est trop long.").nullable(),
  ),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est obligatoire."),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** The signed-in customer, as returned by the API (never includes the password hash). */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  /** ISO 8601 date. */
  createdAt: string;
}

/** GET /api/auth/session: `user` is null for anonymous visitors. */
export interface SessionResponse {
  user: User | null;
}
