import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthError } from "@/lib/apiClient";
import { displayName } from "@/features/auth";
import { listRecommendations, MAX_RECOMMENDATIONS, type Exhibition } from "@/features/exhibitions";
import { useAdmin } from "@/layout";

export default function HomePage() {
  const { user, signOut } = useAdmin();
  const [recommended, setRecommended] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRecommended(await listRecommendations());
    } catch (err) {
      if (err instanceof AuthError) {
        signOut(`${err.message} Please sign in again.`);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold">Hello {displayName(user)}</h1>
        <p className="mt-1 text-neutral-600">Welcome to the JH Mural admin portal.</p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured exhibitions</h2>
          <Link to="/exhibitions" className="text-sm font-medium text-violet-700 hover:underline">
            Manage →
          </Link>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-md bg-red-100 p-4 text-red-800">
            <span>{error}</span>
            <button type="button" onClick={load} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-neutral-600">Loading…</p>
        ) : recommended.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-600">
            No exhibitions featured yet.{" "}
            <Link to="/exhibitions" className="font-medium text-violet-700 hover:underline">
              Pick up to {MAX_RECOMMENDATIONS} on the Exhibitions page.
            </Link>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {recommended.map((e) => (
              <li key={e.id} className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                  {e.recommend_position}
                </span>
                {e.image_url ? (
                  <img src={e.image_url} alt="" className="h-12 w-12 rounded object-cover" />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded bg-neutral-100" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{e.title}</p>
                  {e.location && <p className="truncate text-sm text-neutral-600">{e.location}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
