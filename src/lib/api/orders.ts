import { createClient } from "@/lib/supabase/client";
import type { DbOrder } from "@/lib/types/database";

function getSupabase() {
  return createClient();
}

export async function fetchUserOrders(userId: string): Promise<DbOrder[]> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function createOrder(orderData: {
  user_id: string;
  items: Array<{ product_id: string; quantity: number; price: number }>;
  total: number;
  delivery_address: string;
  delivery_fee: number;
  payment_method: "mpesa" | "stripe";
  status: "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered";
}) {
  const { data, error } = await getSupabase()
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered",
) {
  const { data, error } = await getSupabase()
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) return null;
  return data;
}
