import { existsSync } from "node:fs";
import path from "node:path";
import { serverRoot } from "./paths.ts";

/**
 * Loads server/.env into process.env when the file exists. Variables already
 * defined in the real environment (Docker, CI…) keep their value.
 *
 * Done in code rather than with `node --env-file-if-exists`, which crashes
 * `node --watch` when the file is missing (Node 24).
 */
export function loadEnvFile(): void {
  const file = path.join(serverRoot, ".env");
  if (existsSync(file)) process.loadEnvFile(file);
}
