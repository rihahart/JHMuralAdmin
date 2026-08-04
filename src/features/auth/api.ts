import { authHeaders, request } from "@/lib/apiClient";
import type { AdminUser } from "./types";

/** Exchange a Google ID token for an HttpOnly session cookie; return the user. */
export function createSession(credential: string): Promise<AdminUser> {
  return request<AdminUser>(
    "/auth/session",
    {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ credential }),
    },
    "Could not verify your sign-in.",
  );
}

/** Clear the HttpOnly session cookie. */
export function destroySession(): Promise<void> {
  return request<void>(
    "/auth/session",
    { method: "DELETE" },
    "Could not sign out.",
  );
}

/** Verify the current cookie session with the backend and return the user. */
export function fetchMe(): Promise<AdminUser> {
  return request<AdminUser>(
    "/auth/me",
    {},
    "Could not verify your sign-in.",
  );
}
