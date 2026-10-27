// Champs alignés sur le schéma BDD : starts_at/ends_at, max_capacity
// spots_taken est calculé côté API (vue workshops_with_spots)
export interface Workshop {
  id: string;
  title: string;
  description: string;
  starts_at: string; // ISO 8601
  ends_at: string;   // ISO 8601
  max_capacity: number;
  spots_taken: number; // champ calculé via la vue BDD
  cover_url?: string;
}

