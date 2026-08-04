export interface Exhibition {
  id: number;
  source: "whitney" | "manual";
  external_id: string | null;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  url: string | null;
  is_edited: boolean;
  is_hidden: boolean;
  recommended: boolean;
  recommend_position: number | null;
}

export interface ExhibitionInput {
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  image_url?: string | null;
  url?: string | null;
}

export const MAX_RECOMMENDATIONS = 3;
