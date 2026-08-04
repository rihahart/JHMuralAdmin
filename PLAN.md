# Admin Portal — Build Plan

Living checklist. Status: 🔲 todo · 🚧 in progress · ✅ done

## Decisions (locked)
- **Image storage:** Google Cloud Storage bucket (public-read objects).
- **Sidebar tabs:** `Home` (greeting + overview) and `Exhibitions` (management). Home is default.
- **Name source:** Google `name` claim from the ID token (email parsing is unreliable — `ileshshrestha@…` has no dot).
- **No git repo yet** — the user adds it after this change. Extra care, no safety net.

## The core architectural shift
Today exhibitions are read-only, fetched live from the Whitney API. To create/edit
them we make **our DB the source of truth**, syncing Whitney data *into* a unified
`exhibitions` table as an overlay:
- upsert Whitney items by `external_id`
- rows the admin edited (`is_edited=true`) are **protected** from being overwritten
- manual rows (`source='manual'`) are never touched by sync
This is what makes "edit exhibition 1 to add an image → one record, no duplicate" work.

---

## Phase 1 — Backend: exhibitions table + sync + CRUD  [tasks 1, 2] ✅
- ✅ `Exhibition` model + migration `0003`
- ✅ `services/exhibitions.py` — `sync_whitney_exhibitions()` upsert-with-protection (throttled ~1h)
- ✅ `routers/exhibitions.py` — GET / POST / PATCH / DELETE (admin-guarded writes)
- ✅ **Verified end-to-end (17 checks):** resync creates no duplicate, edited rows keep their edits, un-edited rows still refresh.

## Phase 2 — Backend: up to 3 recommendations  [task 3] ✅
- ✅ `RecommendedExhibition` → FK `exhibitions.id` + `position`; migration `0004`
- ✅ `GET/POST/DELETE /recommendations` — max 3 enforced (409 on 4th), ordered
- ✅ `/whitney-exhibitions` stays working: `recommended_exhibition_id` (top) + `recommended_exhibition_ids`

## Phase 4 — Backend user identity ✅ (already returned by `/auth/me`)

> Backend verified on **local** Postgres. ⚠️ **Neon still at revision `0002`** — run
> `alembic upgrade head` against Neon before deploying.

## Phase 3 — Backend: image upload (GCS)  [task 1] ✅ (code) / ⚠️ needs bucket to test
- ✅ Added `google-cloud-storage` + `python-multipart`
- ✅ `services/storage.py` + `POST /uploads/image` (admin, ≤5 MB, jpeg/png/webp/gif)
- ✅ Modal has a file picker (uploads → fills `image_url`) **and** a URL field as fallback
- ✅ Fails closed: 503 when `GCS_BUCKET` unset (verified) → admin just pastes a URL
- 🔲 **You:** create bucket (public-read objects), set `GCS_BUCKET` in `backend/.env`; grant Cloud Run SA Storage Object Admin in prod; `gcloud auth application-default login` locally

## Phase 4 — Backend: user identity  [task 6]
- ✅ `/auth/me` already returns `name` from the Google token (no change needed)

## Phase 5 — Frontend: sidebar + routing  [tasks 4, 5, 6] ✅
- ✅ `react-router-dom` v7; `Layout` with persistent sidebar (Home, Exhibitions), user name at top, **Sign out pinned to bottom**
- ✅ `Home` (default) → "Hello {name}" + featured-exhibitions overview
- ✅ `Exhibitions` route → management screen
- ✅ Typechecks; sign-in renders; no console errors (full signed-in flow to be tested by user)

## Phase 6 — Frontend: exhibition management UI  [tasks 1, 2, 3] ✅
- ✅ "Add exhibition" button → modal (name, dates, location, image) → `POST`
- ✅ Edit button per row → same modal prefilled → `PATCH` (Whitney + manual)
- ✅ Feature/Unfeature up to 3 — "x / 3" indicator, disabled when full
- ✅ Delete (manual) / Hide (Whitney)

## Phase 7 — Migrate + verify
- 🔲 Run `0003`/`0004` on local + Neon
- 🔲 Smoke-test endpoints; verify sync-no-duplicate end-to-end; confirm website still renders
