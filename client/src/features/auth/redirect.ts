/**
 * Where to go after signing in. Only paths of this site are accepted, so a
 * crafted link cannot send the visitor to another website (open redirect).
 */
export function safeRedirect(
  target: string | null,
  fallback = "/compte",
): string {
  if (
    !target?.startsWith("/") ||
    target.startsWith("//") ||
    target.includes("\\")
  ) {
    return fallback;
  }
  return target;
}

/** Link to the sign-in page that comes back to `path` afterwards. */
export const loginLink = (path: string) =>
  `/connexion?redirect=${encodeURIComponent(path)}`;
