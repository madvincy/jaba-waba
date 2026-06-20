import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Return products with images, description, tags, variants and availability
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const supabase = await createClient();

  // fetch products (case-insensitive category match)
  let prodQuery = supabase.from("products").select("*").order("name");
  if (category) prodQuery = prodQuery.eq("category", category.toLowerCase());

  const { data: products, error: pErr } = await prodQuery;
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const productIds = (products ?? []).map((p: any) => p.id);

  // fetch variants for products
  const { data: variants = [], error: vErr } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds);
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  // fetch stock per variant and per product (legacy product_stock)
  const { data: variantStock = [], error: vsErr } = await supabase
    .from("product_stock_variants")
    .select("variant_id, quantity");
  if (vsErr) return NextResponse.json({ error: vsErr.message }, { status: 500 });

  const { data: productStock = [], error: psErr } = await supabase
    .from("product_stock")
    .select("product_id, quantity");
  if (psErr) return NextResponse.json({ error: psErr.message }, { status: 500 });

  // aggregate variant stock
  const variantQty = new Map<string, number>();
  for (const row of (variantStock ?? [])) {
    variantQty.set(row.variant_id, (variantQty.get(row.variant_id) ?? 0) + (row.quantity ?? 0));
  }

  // aggregate product stock (legacy)
  const productQty = new Map<string, number>();
  for (const row of (productStock ?? [])) {
    productQty.set(row.product_id, (productQty.get(row.product_id) ?? 0) + (row.quantity ?? 0));
  }

  // merge
  function normalizeCategory(cat: string | null | undefined) {
    if (!cat) return "";
    const c = String(cat).toLowerCase();
    if (c === "juice") return "Juice";
    if (c === "merch") return "Merch";
    if (c === "pack" || c === "party-pack" || c === "party pack") return "Party Pack";
    if (c === "event") return "Event";
    return c.charAt(0).toUpperCase() + c.slice(1);
  }

  const out = (products ?? []).map((p: any) => {
    const pVariants = (variants ?? []).filter((v: any) => v.product_id === p.id).map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price ?? null,
      quantity: variantQty.get(v.id) ?? 0,
      available: (variantQty.get(v.id) ?? 0) > 0,
    }));

    const totalLegacy = productQty.get(p.id) ?? 0;
    const variantTotal = pVariants.reduce((s: number, v: any) => s + v.quantity, 0);
    const total = totalLegacy + variantTotal;

    const imageArray = p.images ?? [];
    return {
      ...p,
      image: imageArray[0] || "",
      category: normalizeCategory(p.category),
      images: imageArray,
      description: p.description ?? "",
      tags: p.tags ?? [],
      variants: pVariants,
      totalStock: total,
      available: total > 0,
    };
  });

  return NextResponse.json({ data: out });
}
