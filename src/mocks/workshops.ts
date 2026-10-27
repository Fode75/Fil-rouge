import type { Workshop } from "../types/workshop";

// DONNÉES FICTIVES : à remplacer par l'API Supabase.
export const mockWorkshops: Workshop[] = [
  {
    id: "1",
    title: "Réparer sa lampe",
    description: "Diagnostiquer une panne simple et remplacer un câble.",
    starts_at: "2026-11-14T14:00:00",
    ends_at: "2026-11-14T16:00:00",
    max_capacity: 8,
    spots_taken: 5,
  },
  {
    id: "2",
    title: "Rempailler une chaise",
    description: "Redonner une assise à une chaise en bois.",
    starts_at: "2026-11-21T10:00:00",
    ends_at: "2026-11-21T13:00:00",
    max_capacity: 6,
    spots_taken: 6,
  },
  {
    id: "3",
    title: "Customiser un livre",
    description: "Reliure et couvertures à partir de matériaux de récupération.",
    starts_at: "2026-12-05T15:00:00",
    ends_at: "2026-12-05T17:00:00",
    max_capacity: 10,
    spots_taken: 2,
  },
];

