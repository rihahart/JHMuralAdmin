import { useEffect, useState } from "react";
import { uploadImage } from "./api";
import type { Exhibition, ExhibitionInput } from "./types";

interface Props {
  /** The exhibition being edited, or null when adding a new one. */
  exhibition: Exhibition | null;
  onClose: () => void;
  onSubmit: (payload: ExhibitionInput) => Promise<void>;
}

interface FormState {
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  image_url: string;
  url: string;
}

function toForm(e: Exhibition | null): FormState {
  return {
    title: e?.title ?? "",
    start_date: e?.start_date ?? "",
    end_date: e?.end_date ?? "",
    location: e?.location ?? "",
    image_url: e?.image_url ?? "",
    url: e?.url ?? "",
  };
}

export default function ExhibitionModal({ exhibition, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(exhibition));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setForm(toForm(exhibition)), [exhibition]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      // If uploads aren't configured yet (503), the URL field still works.
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    } finally {
      setUploading(false);
    }
  };

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError("End date must be on or after the start date.");
      return;
    }

    setSaving(true);
    try {
      // Empty strings become null so the backend clears the field.
      const payload: ExhibitionInput = {
        title: form.title.trim(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        location: form.location.trim() || null,
        image_url: form.image_url.trim() || null,
        url: form.url.trim() || null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  };

  const field = "w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900";
  const label = "flex flex-col gap-1 text-sm font-medium text-neutral-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold">
          {exhibition ? "Edit exhibition" : "Add exhibition"}
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className={label}>
            Name
            <input className={field} value={form.title} onChange={set("title")} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className={label}>
              Start date
              <input type="date" className={field} value={form.start_date} onChange={set("start_date")} />
            </label>
            <label className={label}>
              End date
              <input type="date" className={field} value={form.end_date} onChange={set("end_date")} />
            </label>
          </div>

          <label className={label}>
            Location
            <input className={field} value={form.location} onChange={set("location")} placeholder="e.g. 84th St & Roosevelt Ave" />
          </label>

          <label className={label}>
            Link (URL)
            <input className={field} value={form.url} onChange={set("url")} placeholder="https://…" />
          </label>

          <div className={label}>
            Image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onPickFile}
              disabled={uploading}
              aria-label="Upload an image file"
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
            />
            {uploading && <span className="text-sm text-neutral-500">Uploading…</span>}
            <input
              className={field}
              value={form.image_url}
              onChange={set("image_url")}
              aria-label="Image URL"
              placeholder="…or paste an image URL"
            />
          </div>
          {form.image_url.trim() && (
            <img
              src={form.image_url}
              alt="preview"
              className="max-h-40 w-full rounded-md object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
              onLoad={(e) => (e.currentTarget.style.display = "block")}
            />
          )}

          {error && <p className="rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : exhibition ? "Save changes" : "Add exhibition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
