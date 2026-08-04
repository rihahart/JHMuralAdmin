import type { AdminUser } from "./types";

/**
 * A human name for the signed-in admin.
 *
 * Prefers the Google profile name (reliably "Ilesh Shrestha"). Falls back to
 * the email local-part only if the name is missing — and note that addresses
 * like `ileshshrestha@…` have no separator, so the Google name is far better.
 */
export function displayName(user: AdminUser | null): string {
  if (!user) return "";
  if (user.name && user.name.trim()) return user.name.trim();

  const local = user.email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return user.email;
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
