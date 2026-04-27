// ─── Raw API shape ───────────────────────────────────────────────
export type ApiCategory = {
  _id?: string;
  category_id: string;
  name: string;
  is_active?: boolean;
};

// ─── App UI shape (normalized) ───────────────────────────────────
export type Category = {
  id: string;
  name: string;
};