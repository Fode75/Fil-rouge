// Champs alignés sur le schéma BDD : starts_at/ends_at, title (pas label)
export interface Shift {
  id: string;
  title: string;
  starts_at: string; // ISO 8601
  ends_at: string;   // ISO 8601
  description?: string;
  location?: string;
}

