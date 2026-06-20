import { apiFetch } from "./fetcher";

export type SeedResult = {
  success: boolean;
  message: string;
  counts: Record<string, number>;
};

export async function seedDatabase(): Promise<SeedResult> {
  return apiFetch<SeedResult>("/api/seed", { method: "POST" });
}
