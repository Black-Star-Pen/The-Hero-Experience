import path from "node:path";

/** Absolute path of the server package, so relative paths do not depend on the working directory. */
export const serverRoot = path.resolve(import.meta.dirname, "../..");
