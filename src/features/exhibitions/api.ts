import { authHeaders, request } from "@/lib/apiClient";
import type { Exhibition, ExhibitionInput } from "./types";

// --- exhibitions --------------------------------------------------------

export function listExhibitions(): Promise<Exhibition[]> {
  return request<Exhibition[]>("/exhibitions", {}, "Could not load exhibitions.");
}

export function createExhibition(payload: ExhibitionInput): Promise<Exhibition> {
  return request<Exhibition>(
    "/exhibitions",
    { method: "POST", headers: authHeaders(true), body: JSON.stringify(payload) },
    "Could not create the exhibition.",
  );
}

export function updateExhibition(
  id: number,
  payload: Partial<ExhibitionInput>,
): Promise<Exhibition> {
  return request<Exhibition>(
    `/exhibitions/${id}`,
    { method: "PATCH", headers: authHeaders(true), body: JSON.stringify(payload) },
    "Could not save the exhibition.",
  );
}

export function deleteExhibition(id: number): Promise<void> {
  return request<void>(
    `/exhibitions/${id}`,
    { method: "DELETE", headers: authHeaders() },
    "Could not delete the exhibition.",
  );
}

// --- recommendations ----------------------------------------------------

export function listRecommendations(): Promise<Exhibition[]> {
  return request<Exhibition[]>(
    "/recommendations",
    {},
    "Could not load recommendations.",
  );
}

export function addRecommendation(exhibitionId: number): Promise<Exhibition[]> {
  return request<Exhibition[]>(
    "/recommendations",
    {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ exhibition_id: exhibitionId }),
    },
    "Could not add the recommendation.",
  );
}

export function removeRecommendation(exhibitionId: number): Promise<void> {
  return request<void>(
    `/recommendations/${exhibitionId}`,
    { method: "DELETE", headers: authHeaders() },
    "Could not remove the recommendation.",
  );
}

// --- image upload -------------------------------------------------------

/** Upload an image file to the backend (GCS) and return its public URL. */
export function uploadImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  // No Content-Type header — the browser sets the multipart boundary.
  return request<{ url: string }>(
    "/uploads/image",
    { method: "POST", headers: authHeaders(), body },
    "Could not upload the image.",
  );
}
