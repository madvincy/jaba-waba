import type { DbCategory } from "@/lib/types/database";
import { apiFetch } from "./fetcher";

export async function fetchCategories(): Promise<DbCategory[]> {
  const { data } = await apiFetch<{ data: DbCategory[] }>("/api/categories");
  return data;
}
