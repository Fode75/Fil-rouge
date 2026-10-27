// Champs alignés sur le schéma BDD : workshop_id, joined via API
export interface Registration {
  id: string;
  workshop_id: string;
  workshop_title: string; // enrichi côté API (JOIN)
  starts_at: string; // ISO 8601
}

