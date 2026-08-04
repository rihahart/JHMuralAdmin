import { useCallback, useEffect, useState } from "react";
import { createSession, destroySession, fetchMe } from "./api";
import type { AdminUser } from "./types";

export type AuthStatus = "loading" | "signed-out" | "signed-in";

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  /** Hand a Google ID token to the backend; it stores it in an HttpOnly cookie. */
  const applyToken = useCallback(async (token: string) => {
    try {
      const me = await createSession(token);
      setUser(me);
      setStatus("signed-in");
      setError(null);
    } catch (err) {
      setUser(null);
      setStatus("signed-out");
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    }
  }, []);

  const signOut = useCallback((message?: string) => {
    // Fire-and-forget cookie clear; local state must clear even if the
    // network call fails (expired cookie, offline, etc.).
    void destroySession().catch(() => {});
    setUser(null);
    setStatus("signed-out");
    setError(message ?? null);
    window.google?.accounts.id.disableAutoSelect();
  }, []);

  // Restore an existing HttpOnly-cookie session on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          setStatus("signed-in");
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus("signed-out");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, status, error, applyToken, signOut, setError };
}
