import type { DbProduct } from "@/lib/types/database";
import { apiFetch } from "./fetcher";

export async function fetchProducts(category?: string): Promise<DbProduct[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const { data } = await apiFetch<{ data: DbProduct[] }>(`/api/products${params}`);
  return data;
}
