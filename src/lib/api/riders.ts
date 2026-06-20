import type { DbRider } from "@/lib/types/database";
import { apiFetch } from "./fetcher";

export async function fetchRiders(): Promise<DbRider[]> {
  const { data } = await apiFetch<{ data: DbRider[] }>("/api/riders");
  return data;
}
