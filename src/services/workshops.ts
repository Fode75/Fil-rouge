import { mockWorkshops } from "../mocks/workshops";
import type { Workshop } from "../types/workshop";

// TODO: remplacer par des appels Supabase. Les pages n'importent jamais src/mocks directement.
export const getWorkshops = async (): Promise<Workshop[]> => mockWorkshops;

export const getWorkshop = async (id: string): Promise<Workshop | undefined> =>
  mockWorkshops.find((w) => w.id === id);

export async function registerToWorkshop(
  _id: string,
  _data: { name: string; email: string }
): Promise<void> {
  throw new Error("L'inscription n'est pas encore disponible : l'API n'est pas branchée.");
}

