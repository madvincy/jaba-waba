// lib/hooks/useStaffData.ts
// Drop-in replacement for all the useState mock data in StaffDashboard

"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchStores, fetchStaffUsers, fetchProducts, fetchEvents,
  fetchPacks, fetchOrders, fetchDeliveries, fetchSales,
  fetchDashboardSummary, getRolePermissions,
  upsertStore, deleteStore,
  upsertStaffUser, deleteStaffUser, updateUserStatus,
  upsertProduct, deleteProduct,
  upsertEvent, deleteEvent,
  upsertPack, deletePack,
  upsertOrder, updateOrderStatus, deleteOrder,
  updateDeliveryStatus, assignDeliveryRider,
  subscribeToAll,
} from "@/lib/api/staff";
import type {
  StoreWithManager, DbStaffUser, ProductWithStock, DbEvent,
  DbPack, OrderWithRelations, DeliveryWithRider, SaleWithStore,
  DashboardSummary, RolePermissions, StaffRole,
  DbStore, DbProduct, DbOrder, DbDelivery,
  OrderStatus, DeliveryStatus, UserStatus,
} from "@/lib/types/staff";

type UseStaffDataProps = {
  role: StaffRole;
  storeId: string | null;
  userId: string;
};

export function useStaffData({ role, storeId, userId }: UseStaffDataProps) {
  const supabase = useMemo(() => createClient(), []);
  const permissions = useMemo(() => getRolePermissions(role, storeId), [role, storeId]);

  // ── State ────────────────────────────────────────────────────────────
  const [stores, setStores] = useState<StoreWithManager[]>([]);
  const [users, setUsers] = useState<DbStaffUser[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [packs, setPacks] = useState<DbPack[]>([]);
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryWithRider[]>([]);
  const [sales, setSales] = useState<SaleWithStore[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isMounted = useRef(true);

  // ── Load all data ────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const riderId = role === "rider" ? userId : undefined;
      const storeIds = storeId ? [storeId] : undefined;

      const [
        storesData,
        usersData,
        productsData,
        eventsData,
        packsData,
        ordersData,
        deliveriesData,
        salesData,
        summaryData,
      ] = await Promise.all([
        fetchStores(supabase),
        fetchStaffUsers(supabase, permissions),
        fetchProducts(supabase, storeIds),
        fetchEvents(supabase),
        fetchPacks(supabase),
        fetchOrders(supabase, permissions, riderId),
        fetchDeliveries(supabase, permissions, riderId),
        fetchSales(supabase, permissions),
        fetchDashboardSummary(supabase, permissions),
      ]);

      if (!isMounted.current) return;

      setStores(storesData);
      setUsers(usersData);
      setProducts(productsData);
      setEvents(eventsData);
      setPacks(packsData);
      setOrders(ordersData);
      setDeliveries(deliveriesData);
      setSales(salesData);
      setSummary(summaryData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("useStaffData loadAll error:", err);
      if (isMounted.current) {
        setError("Failed to load dashboard data. Please refresh.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [supabase, permissions, role, userId, storeId]);

  // ── Initial load + real-time subscription ───────────────────────────
  useEffect(() => {
    isMounted.current = true;
    loadAll();

    const subscription = subscribeToAll(supabase, () => {
      if (isMounted.current) loadAll();
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [loadAll, supabase]);

  // ── Store actions ────────────────────────────────────────────────────
  const saveStore = useCallback(async (store: Partial<DbStore> & { id?: string }) => {
    const saved = await upsertStore(supabase, store);
    if (saved) await loadAll();
    return saved;
  }, [supabase, loadAll]);

  const removeStore = useCallback(async (id: string) => {
    const ok = await deleteStore(supabase, id);
    if (ok) setStores((prev) => prev.filter((s) => s.id !== id));
    return ok;
  }, [supabase]);

  // ── User actions ─────────────────────────────────────────────────────
  const saveUser = useCallback(async (user: Partial<DbStaffUser> & { id?: string }) => {
    const saved = await upsertStaffUser(supabase, user);
    if (saved) await loadAll();
    return saved;
  }, [supabase, loadAll]);

  const removeUser = useCallback(async (id: string) => {
    const ok = await deleteStaffUser(supabase, id);
    if (ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    return ok;
  }, [supabase]);

  const setUserStatus = useCallback(async (userId: string, status: UserStatus) => {
    const ok = await updateUserStatus(supabase, userId, status);
    if (ok) setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u));
    return ok;
  }, [supabase]);

  // ── Product actions ──────────────────────────────────────────────────
  const saveProduct = useCallback(async (
    product: Partial<DbProduct> & { id?: string },
    stockUpdates?: Record<string, number>
  ) => {
    const saved = await upsertProduct(supabase, product, stockUpdates);
    if (saved) await loadAll();
    return saved;
  }, [supabase, loadAll]);

  const removeProduct = useCallback(async (id: string) => {
    const ok = await deleteProduct(supabase, id);
    if (ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    return ok;
  }, [supabase]);

  // ── Event actions ────────────────────────────────────────────────────
  const saveEvent = useCallback(async (event: Partial<DbEvent> & { id?: string }) => {
    const saved = await upsertEvent(supabase, event);
    if (saved) await loadAll();
    return saved;
  }, [supabase, loadAll]);

  const removeEvent = useCallback(async (id: string) => {
    const ok = await deleteEvent(supabase, id);
    if (ok) setEvents((prev) => prev.filter((e) => e.id !== id));
    return ok;
  }, [supabase]);

  // ── Pack actions ─────────────────────────────────────────────────────
  const savePack = useCallback(async (pack: Partial<DbPack> & { id?: string }) => {
    const saved = await upsertPack(supabase, pack);
    if (saved) await loadAll();
    return saved;
  }, [supabase, loadAll]);

  const removePack = useCallback(async (id: string) => {
    const ok = await deletePack(supabase, id);
    if (ok) setPacks((prev) => prev.filter((p) => p.id !== id));
    return ok;
  }, [supabase]);

  // ── Order actions ────────────────────────────────────────────────────
  const saveOrder = useCallback(async (order: Partial<DbOrder> & { id?: string }) => {
    const saved = await upsertOrder(supabase, order);
    if (saved) await loadAll();
    return saved;
  }, [supabase, loadAll]);

  const changeOrderStatus = useCallback(async (
    orderId: string,
    status: OrderStatus,
    riderId?: string
  ) => {
    const ok = await updateOrderStatus(supabase, orderId, status, riderId);
    if (ok) {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status, assigned_rider_id: riderId ?? o.assigned_rider_id } : o)
      );
    }
    return ok;
  }, [supabase]);

  const removeOrder = useCallback(async (id: string) => {
    const ok = await deleteOrder(supabase, id);
    if (ok) setOrders((prev) => prev.filter((o) => o.id !== id));
    return ok;
  }, [supabase]);

  // ── Delivery actions ─────────────────────────────────────────────────
  const changeDeliveryStatus = useCallback(async (
    deliveryId: string,
    status: DeliveryStatus
  ) => {
    const ok = await updateDeliveryStatus(supabase, deliveryId, status);
    if (ok) {
      setDeliveries((prev) =>
        prev.map((d) => d.id === deliveryId ? { ...d, status, last_update: "Just now" } : d)
      );
    }
    return ok;
  }, [supabase]);

  const assignRider = useCallback(async (deliveryId: string, riderId: string) => {
    const ok = await assignDeliveryRider(supabase, deliveryId, riderId);
    if (ok) await loadAll();
    return ok;
  }, [supabase, loadAll]);

  return {
    // Data
    stores,
    users,
    products,
    events,
    packs,
    orders,
    deliveries,
    sales,
    summary,
    permissions,

    // Meta
    loading,
    error,
    lastRefresh,
    refresh: loadAll,

    // Store actions
    saveStore,
    removeStore,

    // User actions
    saveUser,
    removeUser,
    setUserStatus,

    // Product actions
    saveProduct,
    removeProduct,

    // Event actions
    saveEvent,
    removeEvent,

    // Pack actions
    savePack,
    removePack,

    // Order actions
    saveOrder,
    changeOrderStatus,
    removeOrder,

    // Delivery actions
    changeDeliveryStatus,
    assignRider,
  };
}