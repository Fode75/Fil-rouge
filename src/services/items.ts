import { mockItems } from "../mocks/items";
import type { Item } from "../types/item";

// TODO: remplacer par un appel Supabase (supabase.from('items').select())
export const getItems = async (): Promise<Item[]> => mockItems;

