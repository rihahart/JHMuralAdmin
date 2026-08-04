// Transport layer for the backend API. Feature modules build on top of this
// (see src/features/*/api.ts); it holds no domain knowledge itself.

const BASE = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Raised when the backend rejects our identity, so the UI can sign out. */
export class AuthError extends Error {}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function authHeaders(json = false): Record<string, string> {
  const h: Record<string, string> = {};
  if (authToken) h.Authorization = `Bearer ${authToken}`;
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function detail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (body?.detail)
      return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    // no JSON body
  }
  return fallback;
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  fallback = "Request failed.",
): Promise<T> {
  const res = await fetch(apiUrl(path), init);
  if (res.status === 401 || res.status === 403) {
    throw new AuthError(await detail(res, "You are not authorized."));
  }
  if (!res.ok) {
    throw new Error(await detail(res, fallback));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
