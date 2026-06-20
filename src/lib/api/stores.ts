import type { DbStoreWithInventory } from "@/lib/types/database";
import { apiFetch } from "./fetcher";

export async function fetchStores(): Promise<DbStoreWithInventory[]> {
  const { data } = await apiFetch<{ data: DbStoreWithInventory[] }>("/api/stores");
  return data;
}
