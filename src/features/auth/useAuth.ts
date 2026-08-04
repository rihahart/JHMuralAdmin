import { useCallback, useEffect, useState } from "react";
import { setAuthToken } from "@/lib/apiClient";
import { fetchMe } from "./api";
import type { AdminUser } from "./types";

// Session storage, not local storage: the token dies with the tab, and Google
// ID tokens only last an hour anyway.
const TOKEN_KEY = "jhmural_admin_token";

export type AuthStatus = "loading" | "signed-out" | "signed-in";

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  /** Validate a Google ID token with the backend and sign in on success. */
  const applyToken = useCallback(async (token: string) => {
    setAuthToken(token);
    try {
      const me = await fetchMe();
      sessionStorage.setItem(TOKEN_KEY, token);
      setUser(me);
      setStatus("signed-in");
      setError(null);
    } catch (err) {
      setAuthToken(null);
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setStatus("signed-out");
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    }
  }, []);

  const signOut = useCallback((message?: string) => {
    setAuthToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("signed-out");
    setError(message ?? null);
    window.google?.accounts.id.disableAutoSelect();
  }, []);

  // Restore an existing session on load.
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      applyToken(stored);
    } else {
      setStatus("signed-out");
    }
  }, [applyToken]);

  return { user, status, error, applyToken, signOut, setError };
}
