/**
 * @deprecated Use `@/lib/supabase/client` instead.
 * Kept for backwards compatibility with existing imports.
 */
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export { supabase };

export async function loginWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function fetchProducts() {
  return supabase.from("products").select("*");
}

export async function fetchStoreInventory(storeId: string) {
  return supabase.from("inventory").select("*").eq("store_id", storeId);
}

export async function fetchReviews() {
  return supabase.from("reviews").select("*");
}

export async function postReview(review: {
  customer: string;
  rating: number;
  text: string;
}) {
  return supabase.from("reviews").insert(review);
}
