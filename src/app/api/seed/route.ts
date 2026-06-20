import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SEED_CATEGORIES,
  SEED_EVENTS,
  SEED_INVENTORY,
  SEED_PRODUCTS,
  SEED_REVIEWS,
  SEED_RIDERS,
  SEED_STORES,
} from "@/lib/seed-data";

export async function POST() {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase admin client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const counts: Record<string, number> = {};

  const steps = [
    {
      table: "categories",
      data: SEED_CATEGORIES,
      onConflict: "id",
    },
    {
      table: "products",
      data: SEED_PRODUCTS,
      onConflict: "id",
    },
    {
      table: "stores",
      data: SEED_STORES,
      onConflict: "id",
    },
    {
      table: "inventory",
      data: SEED_INVENTORY,
      onConflict: "store_id,product_id",
    },
    {
      table: "riders",
      data: SEED_RIDERS,
      onConflict: "id",
    },
    {
      table: "reviews",
      data: SEED_REVIEWS,
      onConflict: "id",
    },
    {
      table: "events",
      data: SEED_EVENTS,
      onConflict: "id",
    },
  ] as const;

  for (const step of steps) {
    const { error } = await supabase
      .from(step.table)
      .upsert([...step.data], { onConflict: step.onConflict });

    if (error) {
      return NextResponse.json(
        { error: `Failed to seed ${step.table}: ${error.message}` },
        { status: 500 },
      );
    }
    counts[step.table] = step.data.length;
  }

  return NextResponse.json({
    success: true,
    message: "Database seeded successfully with Jaba Waba sample data.",
    counts,
  });
}
