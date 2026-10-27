import type { Item } from "../types/item";

// DONNÉES FICTIVES : à remplacer par l'API Supabase.
export const mockItems: Item[] = [
  { id: "1", title: "Chaise en bois", category: "furniture", price: 15, status: "available" },
  { id: "2", title: "Lampe de chevet", category: "electronics", price: 8, status: "available" },
  { id: "3", title: "Lot de 4 livres", category: "books", price: 5, status: "available" },
];

