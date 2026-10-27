// Statuts et champs alignés sur le schéma BDD : item_status ENUM, colonne title
export type ItemStatus = "available" | "reserved" | "sold" | "donated" | "unavailable";
export type ItemCategory = "furniture" | "clothing" | "books" | "electronics" | "kitchenware" | "other";

export interface Item {
  id: string;
  title: string;
  category: ItemCategory;
  price: number;
  status: ItemStatus;
  description?: string;
  image_url?: string;
}

