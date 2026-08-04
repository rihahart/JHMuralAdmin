import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthError } from "@/lib/apiClient";
import {
  addRecommendation,
  createExhibition,
  deleteExhibition,
  ExhibitionModal,
  listExhibitions,
  MAX_RECOMMENDATIONS,
  removeRecommendation,
  updateExhibition,
  type Exhibition,
  type ExhibitionInput,
} from "@/features/exhibitions";
import { useAdmin } from "@/layout";

function formatRange(start: string | null, end: string | null): string {
  const fmt = (v: string | null) => {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const s = fmt(start);
  const e = fmt(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? e ?? "No dates";
}

export default function ExhibitionsPage() {
  const { signOut } = useAdmin();
  const [items, setItems] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exhibition | null>(null);

  const onError = useCallback(
    (err: unknown) => {
      if (err instanceof AuthError) {
        signOut(`${err.message} Please sign in again.`);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong.");
    },
    [signOut]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await listExhibitions());
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  const recommendedCount = useMemo(
    () => items.filter((e) => e.recommended).length,
    [items]
  );

  const ordered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? items.filter((e) => e.title.toLowerCase().includes(q)) : items;
    // Recommended first (by position), then the rest.
    return [...filtered].sort((a, b) => {
      const pa = a.recommend_position ?? Infinity;
      const pb = b.recommend_position ?? Infinity;
      return pa - pb;
    });
  }, [items, query]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (e: Exhibition) => {
    setEditing(e);
    setModalOpen(true);
  };

  const submitModal = async (payload: ExhibitionInput) => {
    setBusyId(editing ? editing.id : "new");
    try {
      if (editing) {
        await updateExhibition(editing.id, payload);
      } else {
        await createExhibition(payload);
      }
      await load();
    } catch (err) {
      // Session errors sign the user out; other errors surface in the modal.
      if (err instanceof AuthError) {
        onError(err);
        return;
      }
      throw err;
    } finally {
      setBusyId(null);
    }
  };

  const toggleRecommend = async (e: Exhibition) => {
    setBusyId(e.id);
    setError(null);
    try {
      if (e.recommended) {
        await removeRecommendation(e.id);
      } else {
        await addRecommendation(e.id);
      }
      await load();
    } catch (err) {
      onError(err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (e: Exhibition) => {
    if (!confirm(`Remove "${e.title}"?`)) return;
    setBusyId(e.id);
    setError(null);
    try {
      await deleteExhibition(e.id);
      await load();
    } catch (err) {
      onError(err);
    } finally {
      setBusyId(null);
    }
  };

  const recommendFull = recommendedCount >= MAX_RECOMMENDATIONS;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exhibitions</h1>
          <p className="text-neutral-600">
            {recommendedCount} of {MAX_RECOMMENDATIONS} featured on the website.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add exhibition
        </button>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-md bg-red-100 p-4 text-red-800">
          <span>{error}</span>
          <button type="button" onClick={load} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search exhibitions…"
        aria-label="Search exhibitions"
        className="w-full rounded-md border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
      />

      {loading ? (
        <p className="py-8 text-neutral-600">Loading exhibitions…</p>
      ) : ordered.length === 0 ? (
        <p className="py-8 text-neutral-600">No exhibitions found.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ordered.map((e) => {
            const busy = busyId === e.id;
            const cannotRecommend = !e.recommended && recommendFull;
            return (
              <li
                key={e.id}
                className={`flex flex-wrap items-center gap-4 rounded-lg border p-4 ${
                  e.recommended ? "border-2 border-neutral-900 bg-violet-50" : "border-neutral-200 bg-white"
                }`}
              >
                {e.image_url ? (
                  <img src={e.image_url} alt="" className="h-14 w-14 rounded object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded bg-neutral-100 text-xs text-neutral-400">
                    No image
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.recommended && (
                      <span className="bg-neutral-900 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                        Featured #{e.recommend_position}
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        e.source === "manual" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {e.source}
                    </span>
                    <p className="truncate font-semibold">{e.title}</p>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {formatRange(e.start_date, e.end_date)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRecommend(e)}
                    disabled={busy || cannotRecommend}
                    title={cannotRecommend ? `Remove one of the ${MAX_RECOMMENDATIONS} featured first` : ""}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${
                      e.recommended
                        ? "border border-neutral-300 hover:bg-neutral-100"
                        : "bg-violet-600 text-white hover:opacity-90"
                    }`}
                  >
                    {e.recommended ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(e)}
                    disabled={busy}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition hover:bg-neutral-100 disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    disabled={busy}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                  >
                    {e.source === "manual" ? "Delete" : "Hide"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <ExhibitionModal
          exhibition={editing}
          onClose={() => setModalOpen(false)}
          onSubmit={submitModal}
        />
      )}
    </div>
  );
}
