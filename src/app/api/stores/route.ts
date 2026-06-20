import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbStoreWithInventory } from "@/lib/types/database";

export async function GET() {
  const supabase = await createClient();

  const [storesResult, inventoryResult] = await Promise.all([
    supabase.from("stores").select("*").order("name"),
    supabase.from("inventory").select("store_id, product_id, stock"),
  ]);

  if (storesResult.error) {
    return NextResponse.json({ error: storesResult.error.message }, { status: 500 });
  }
  if (inventoryResult.error) {
    return NextResponse.json({ error: inventoryResult.error.message }, { status: 500 });
  }

  const inventoryByStore = new Map<string, { product_id: string; stock: number }[]>();
  for (const row of inventoryResult.data ?? []) {
    const list = inventoryByStore.get(row.store_id) ?? [];
    list.push({ product_id: row.product_id, stock: row.stock });
    inventoryByStore.set(row.store_id, list);
  }

  const data: DbStoreWithInventory[] = (storesResult.data ?? []).map((store) => ({
    ...store,
    inventory: inventoryByStore.get(store.id) ?? [],
  }));

  return NextResponse.json({ data });
}
