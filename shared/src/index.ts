import { z } from "zod";

// Default validation messages in French, on the client and on the server
z.config(z.locales.fr());

export * from "./api.ts";
export * from "./auth.ts";
export * from "./bookings.ts";
export * from "./dates.ts";
export * from "./demo.ts";
export * from "./fields.ts";
export * from "./heroes.ts";
export * from "./reviews.ts";
export * from "./services.ts";
