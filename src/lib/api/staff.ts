// lib/api/staff.ts
// All data fetching for the staff dashboard, role-aware

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type {
  DbStore, DbStaffUser, DbProduct, DbProductStock,
  DbEvent, DbPack, DbOrder, DbDelivery, DbSale,
  StoreWithManager, ProductWithStock, OrderWithRelations,
  DeliveryWithRider, SaleWithStore, DashboardSummary,
  RolePermissions, StaffRole, OrderStatus, DeliveryStatus,
  EventStatus, UserStatus,
} from "@/lib/types/staff";

// ── Role permissions ─────────────────────────────────────────────────────

export function getRolePermissions(
  role: StaffRole,
  storeId: string | null
): RolePermissions {
  switch (role) {
    case "admin":
      return {
        canViewAllStores: true,
        canEditProducts: true,
        canDeleteRecords: true,
        canViewAllOrders: true,
        canManageUsers: true,
        canExportData: true,
        canViewSales: true,
        canManageDeliveries: true,
        storeId: null,
      };
    case "store-manager":
      return {
        canViewAllStores: false,
        canEditProducts: true,
        canDeleteRecords: false,
        canViewAllOrders: false,
        canManageUsers: false,
        canExportData: true,
        canViewSales: true,
        canManageDeliveries: true,
        storeId,
      };
    case "dispatch":
      return {
        canViewAllStores: true,
        canEditProducts: false,
        canDeleteRecords: false,
        canViewAllOrders: true,
        canManageUsers: false,
        canExportData: false,
        canViewSales: false,
        canManageDeliveries: true,
        storeId: null,
      };
    case "rider":
      return {
        canViewAllStores: false,
        canEditProducts: false,
        canDeleteRecords: false,
        canViewAllOrders: false,
        canManageUsers: false,
        canExportData: false,
        canViewSales: false,
        canManageDeliveries: false,
        storeId: null,
      };
  }
}

// ── Date helpers ─────────────────────────────────────────────────────────

function getDayLabel(dateStr: string): "Today" | "Yesterday" | "Older" {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr.startsWith(today)) return "Today";
  if (dateStr.startsWith(yesterday)) return "Yesterday";
  return "Older";
}

// ── Stores ───────────────────────────────────────────────────────────────

export async function fetchStores(
  supabase: SupabaseClient
): Promise<StoreWithManager[]> {
  const { data, error } = await supabase
    .from("stores")
    .select(`*, manager:staff_users!stores_manager_id_fkey(*)`)
    .order("name");

  if (error) { console.error("fetchStores:", error); return []; }
  return (data ?? []) as StoreWithManager[];
}

export async function upsertStore(
  supabase: SupabaseClient,
  store: Partial<DbStore> & { id?: string }
): Promise<DbStore | null> {
  const isNew = !store.id || store.id.length < 10;
  const payload = { ...store, updated_at: new Date().toISOString() };
  if (isNew) delete payload.id;

  const { data, error } = await (isNew
    ? supabase.from("stores").insert(payload).select().single()
    : supabase.from("stores").update(payload).eq("id", store.id!).select().single());

  if (error) { console.error("upsertStore:", error); return null; }
  return data;
}

export async function deleteStore(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) { console.error("deleteStore:", error); return false; }
  return true;
}

// ── Staff Users ──────────────────────────────────────────────────────────

export async function fetchStaffUsers(
  supabase: SupabaseClient,
  permissions: RolePermissions
): Promise<DbStaffUser[]> {
  let query = supabase.from("staff_users").select("*").order("name");

  // Store managers only see their store's users
  if (!permissions.canViewAllStores && permissions.storeId) {
    query = query.eq("store_id", permissions.storeId);
  }

  const { data, error } = await query;
  if (error) { console.error("fetchStaffUsers:", error); return []; }
  return data ?? [];
}

export async function upsertStaffUser(
  supabase: SupabaseClient,
  user: Partial<DbStaffUser> & { id?: string }
): Promise<DbStaffUser | null> {
  const isNew = !user.id || user.id.length < 10;
  const payload = { ...user, updated_at: new Date().toISOString() };
  if (isNew) delete payload.id;

  const { data, error } = await (isNew
    ? supabase.from("staff_users").insert(payload).select().single()
    : supabase.from("staff_users").update(payload).eq("id", user.id!).select().single());

  if (error) { console.error("upsertStaffUser:", error); return null; }
  return data;
}

export async function deleteStaffUser(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("staff_users").delete().eq("id", id);
  if (error) { console.error("deleteStaffUser:", error); return false; }
  return true;
}

export async function updateUserStatus(
  supabase: SupabaseClient,
  userId: string,
  status: UserStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("staff_users")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) { console.error("updateUserStatus:", error); return false; }
  return true;
}

// ── Products ─────────────────────────────────────────────────────────────

export async function fetchProducts(
  supabase: SupabaseClient,
  storeIds?: string[]
): Promise<ProductWithStock[]> {
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (pErr) { console.error("fetchProducts:", pErr); return []; }

  let stockQuery = supabase
    .from("product_stock")
    .select("*");

  if (storeIds?.length) {
    stockQuery = stockQuery.in("store_id", storeIds);
  }

  const { data: stock, error: sErr } = await stockQuery;
  if (sErr) { console.error("fetchProductStock:", sErr); }

  return (products ?? []).map((p) => ({
    ...p,
    stock: (stock ?? [])
      .filter((s) => s.product_id === p.id)
      .reduce((acc, s) => ({ ...acc, [s.store_id]: s.quantity }), {} as Record<string, number>),
  }));
}

export async function upsertProduct(
  supabase: SupabaseClient,
  product: Partial<DbProduct> & { id?: string },
  stockUpdates?: Record<string, number>
): Promise<DbProduct | null> {
  const isNew = !product.id || product.id.length < 10;
  const payload = { ...product, updated_at: new Date().toISOString() };
  if (isNew) delete payload.id;

  const { data, error } = await (isNew
    ? supabase.from("products").insert(payload).select().single()
    : supabase.from("products").update(payload).eq("id", product.id!).select().single());

  if (error) { console.error("upsertProduct:", error); return null; }

  // Upsert stock per store if provided
  if (stockUpdates && data) {
    const stockRows = Object.entries(stockUpdates).map(([store_id, quantity]) => ({
      product_id: data.id,
      store_id,
      quantity,
      updated_at: new Date().toISOString(),
    }));

    const { error: stockErr } = await supabase
      .from("product_stock")
      .upsert(stockRows, { onConflict: "product_id,store_id" });

    if (stockErr) console.error("upsertProductStock:", stockErr);
  }

  return data;
}

export async function deleteProduct(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) { console.error("deleteProduct:", error); return false; }
  return true;
}

// ── Events ───────────────────────────────────────────────────────────────

export async function fetchEvents(
  supabase: SupabaseClient
): Promise<DbEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) { console.error("fetchEvents:", error); return []; }
  return data ?? [];
}

export async function upsertEvent(
  supabase: SupabaseClient,
  event: Partial<DbEvent> & { id?: string }
): Promise<DbEvent | null> {
  const isNew = !event.id || event.id.length < 10;
  const payload = { ...event, updated_at: new Date().toISOString() };
  if (isNew) delete payload.id;

  const { data, error } = await (isNew
    ? supabase.from("events").insert(payload).select().single()
    : supabase.from("events").update(payload).eq("id", event.id!).select().single());

  if (error) { console.error("upsertEvent:", error); return null; }
  return data;
}

export async function deleteEvent(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) { console.error("deleteEvent:", error); return false; }
  return true;
}

// ── Party Packs ──────────────────────────────────────────────────────────

export async function fetchPacks(
  supabase: SupabaseClient
): Promise<DbPack[]> {
  const { data, error } = await supabase
    .from("party_packs")
    .select("*")
    .order("price");

  if (error) { console.error("fetchPacks:", error); return []; }
  return data ?? [];
}

export async function upsertPack(
  supabase: SupabaseClient,
  pack: Partial<DbPack> & { id?: string }
): Promise<DbPack | null> {
  const isNew = !pack.id || pack.id.length < 10;
  const payload = { ...pack, updated_at: new Date().toISOString() };
  if (isNew) delete payload.id;

  const { data, error } = await (isNew
    ? supabase.from("party_packs").insert(payload).select().single()
    : supabase.from("party_packs").update(payload).eq("id", pack.id!).select().single());

  if (error) { console.error("upsertPack:", error); return null; }
  return data;
}

export async function deletePack(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("party_packs").delete().eq("id", id);
  if (error) { console.error("deletePack:", error); return false; }
  return true;
}

// ── Orders ───────────────────────────────────────────────────────────────

export async function fetchOrders(
  supabase: SupabaseClient,
  permissions: RolePermissions,
  riderId?: string
): Promise<OrderWithRelations[]> {
  let query = supabase
    .from("orders")
    .select(`
      *,
      store:stores(*),
      rider:staff_users!orders_assigned_rider_id_fkey(*)
    `)
    .order("created_at", { ascending: false });

  // Scope by store for managers
  if (!permissions.canViewAllOrders && permissions.storeId) {
    query = query.eq("store_id", permissions.storeId);
  }

  // Scope by rider for rider role
  if (riderId) {
    query = query.eq("assigned_rider_id", riderId);
  }

  const { data, error } = await query;
  if (error) { console.error("fetchOrders:", error); return []; }

  return (data ?? []).map((o) => ({
    ...o,
    day: getDayLabel(o.created_at),
    store: o.store ?? null,
    rider: o.rider ?? null,
  }));
}

export async function upsertOrder(
  supabase: SupabaseClient,
  order: Partial<DbOrder> & { id?: string }
): Promise<DbOrder | null> {
  const isNew = !order.id || order.id.length < 10;
  const payload = { ...order, updated_at: new Date().toISOString() };
  if (isNew) delete payload.id;

  const { data, error } = await (isNew
    ? supabase.from("orders").insert(payload).select().single()
    : supabase.from("orders").update(payload).eq("id", order.id!).select().single());

  if (error) { console.error("upsertOrder:", error); return null; }
  return data;
}

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  status: OrderStatus,
  riderId?: string
): Promise<boolean> {
  const update: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (riderId !== undefined) update.assigned_rider_id = riderId;

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) { console.error("updateOrderStatus:", error); return false; }
  return true;
}

export async function deleteOrder(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) { console.error("deleteOrder:", error); return false; }
  return true;
}

// ── Deliveries ───────────────────────────────────────────────────────────

export async function fetchDeliveries(
  supabase: SupabaseClient,
  permissions: RolePermissions,
  riderId?: string
): Promise<DeliveryWithRider[]> {
  let query = supabase
    .from("deliveries")
    .select(`*, rider:staff_users!deliveries_rider_id_fkey(*)`)
    .order("created_at", { ascending: false });

  // Riders only see their own deliveries
  if (riderId) {
    query = query.eq("rider_id", riderId);
  }

  const { data, error } = await query;
  if (error) { console.error("fetchDeliveries:", error); return []; }

  return (data ?? []).map((d) => ({
    ...d,
    rider: d.rider ?? null,
    coordinates: { lat: Number(d.lat), lng: Number(d.lng) },
  }));
}

export async function updateDeliveryStatus(
  supabase: SupabaseClient,
  deliveryId: string,
  status: DeliveryStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("deliveries")
    .update({ status, last_update: "Just now", updated_at: new Date().toISOString() })
    .eq("id", deliveryId);

  if (error) { console.error("updateDeliveryStatus:", error); return false; }
  return true;
}

export async function assignDeliveryRider(
  supabase: SupabaseClient,
  deliveryId: string,
  riderId: string
): Promise<boolean> {
  const rider = await supabase
    .from("staff_users")
    .select("name")
    .eq("id", riderId)
    .single();

  const { error } = await supabase
    .from("deliveries")
    .update({
      rider_id: riderId,
      status: "pending",
      last_update: "Just now",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId);

  if (error) { console.error("assignDeliveryRider:", error); return false; }
  return true;
}

// ── Sales ────────────────────────────────────────────────────────────────

export async function fetchSales(
  supabase: SupabaseClient,
  permissions: RolePermissions,
  dateFilter?: string
): Promise<SaleWithStore[]> {
  let query = supabase
    .from("sales")
    .select(`*, store:stores(*)`)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (!permissions.canViewAllStores && permissions.storeId) {
    query = query.eq("store_id", permissions.storeId);
  }

  if (dateFilter && dateFilter !== "all") {
    query = query.eq("date", dateFilter);
  }

  const { data, error } = await query;
  if (error) { console.error("fetchSales:", error); return []; }

  return (data ?? []).map((s) => ({ ...s, store: s.store ?? null }));
}

// ── Dashboard Summary ────────────────────────────────────────────────────

export async function fetchDashboardSummary(
  supabase: SupabaseClient,
  permissions: RolePermissions
): Promise<DashboardSummary> {
  // Fetch all data in parallel
  const [ordersResult, salesResult, productsResult, stockResult, storesResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select(`*, store:stores(*), rider:staff_users!orders_assigned_rider_id_fkey(*)`)
        .order("created_at", { ascending: false })
        .then(({ data }) =>
          (data ?? []).map((o) => ({
            ...o,
            day: getDayLabel(o.created_at),
            store: o.store ?? null,
            rider: o.rider ?? null,
          }))
        ),
      supabase
        .from("sales")
        .select(`*, store:stores(*)`)
        .then(({ data }) => (data ?? []).map((s) => ({ ...s, store: s.store ?? null }))),
      supabase.from("products").select("*").then(({ data }) => data ?? []),
      supabase.from("product_stock").select("*").then(({ data }) => data ?? []),
      fetchStores(supabase),
    ]);

  const scopedOrders = permissions.storeId
    ? ordersResult.filter((o) => o.store_id === permissions.storeId)
    : ordersResult;

  const scopedSales = permissions.storeId
    ? salesResult.filter((s) => s.store_id === permissions.storeId)
    : salesResult;

  // Revenue from delivered orders
  const totalRevenue = scopedOrders
    .filter((o) => o.status === "delivered")
    .reduce((a, o) => a + Number(o.total), 0);

  const totalSales = scopedSales.reduce((a, s) => a + Number(s.total), 0);
  const pendingOrders = scopedOrders.filter((o) => ["paid", "preparing"].includes(o.status)).length;
  const activeDeliveries = scopedOrders.filter((o) => o.status === "on the way").length;
  const totalStock = stockResult.reduce((a, s) => a + s.quantity, 0);

  // Last 7 days daily sales
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailySales = last7Days.map((date) => ({
    date,
    total: scopedSales
      .filter((s) => s.date === date)
      .reduce((a, s) => a + Number(s.total), 0),
  }));

  // Orders by status
  const statusList: OrderStatus[] = ["paid", "preparing", "on the way", "delivered", "cancelled"];
  const ordersByStatus = statusList.map((status) => ({
    status,
    count: scopedOrders.filter((o) => o.status === status).length,
  }));

  // Sales by payment method
  const methods = ["mpesa", "cash", "card"] as const;
  const salesByMethod = methods.map((method) => {
    const matching = scopedSales.filter((s) => s.payment_method === method);
    return {
      method,
      count: matching.length,
      amount: matching.reduce((a, s) => a + Number(s.total), 0),
    };
  });

  // Top products by total stock
  const topProducts = productsResult
    .map((p) => ({
      name: p.name,
      total: stockResult
        .filter((s) => s.product_id === p.id)
        .reduce((a, s) => a + s.quantity, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Revenue by store
  const revenueByStore = storesResult.map((store) => ({
    store,
    revenue: ordersResult
      .filter((o) => o.store_id === store.id && o.status === "delivered")
      .reduce((a, o) => a + Number(o.total), 0),
    salesRevenue: salesResult
      .filter((s) => s.store_id === store.id)
      .reduce((a, s) => a + Number(s.total), 0),
    orderCount: ordersResult.filter((o) => o.store_id === store.id).length,
  }));

  return {
    totalRevenue,
    totalSales,
    pendingOrders,
    activeDeliveries,
    totalStock,
    revenueByStore,
    dailySales,
    ordersByStatus,
    salesByMethod,
    topProducts,
    recentOrders: scopedOrders.slice(0, 5),
  };
}

// ── Real-time subscriptions ──────────────────────────────────────────────

export function subscribeToOrders(
  supabase: SupabaseClient,
  onUpdate: () => void
) {
  return supabase
    .channel("orders-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onUpdate)
    .subscribe();
}

export function subscribeToDeliveries(
  supabase: SupabaseClient,
  onUpdate: () => void
) {
  return supabase
    .channel("deliveries-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "deliveries" }, onUpdate)
    .subscribe();
}

export function subscribeToAll(
  supabase: SupabaseClient,
  onUpdate: () => void
) {
  return supabase
    .channel("staff-dashboard-all")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onUpdate)
    .on("postgres_changes", { event: "*", schema: "public", table: "deliveries" }, onUpdate)
    .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, onUpdate)
    .on("postgres_changes", { event: "*", schema: "public", table: "product_stock" }, onUpdate)
    .subscribe();
}
