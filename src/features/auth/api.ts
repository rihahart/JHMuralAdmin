import { authHeaders, request } from "@/lib/apiClient";
import type { AdminUser } from "./types";

/** Verify the current token with the backend and return the signed-in user. */
export function fetchMe(): Promise<AdminUser> {
  return request<AdminUser>(
    "/auth/me",
    { headers: authHeaders() },
    "Could not verify your sign-in.",
  );
}
