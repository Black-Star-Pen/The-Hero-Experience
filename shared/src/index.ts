import { z } from "zod";

// Default validation messages in French, on the client and on the server
z.config(z.locales.fr());

export * from "./api.ts";
export * from "./auth.ts";
export * from "./heroes.ts";
export * from "./services.ts";
