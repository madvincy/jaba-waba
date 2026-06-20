// lib/types/staff.ts
// All types matching your Supabase table schema

export type UserRole = "admin" | "store-manager" | "rider" | "dispatch";
export type UserStatus = "online" | "offline" | "delivering" | "available";
export type OrderStatus = "paid" | "preparing" | "on the way" | "delivered" | "cancelled";
export type DeliveryStatus = "pending" | "picked_up" | "on_the_way" | "delivered" | "cancelled";
export type EventStatus = "active" | "planning" | "closed" | "cancelled";
export type ProductCategory = "juice" | "merch" | "pack";
export type PaymentMethod = "cash" | "mpesa" | "card";
export type SaleStatus = "completed" | "refunded" | "pending";

// ── Database row types (match Supabase columns exactly) ──────────────────

export type DbStore = {
  id: string;
  name: string;
  city: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbStaffUser = {
  id: string;
  name: string;
  role: UserRole;
  store_id: string | null;
  status: UserStatus;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type DbProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  sku: string;
  created_at: string;
  updated_at: string;
};

export type DbProductStock = {
  id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  updated_at: string;
};

export type DbEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  tickets: number;
  price: number;
  status: EventStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type DbPack = {
  id: string;
  title: string;
  juices: number;
  merch: string;
  price: number;
  qty: number;
  description: string;
  created_at: string;
  updated_at: string;
};

export type DbOrder = {
  id: string;
  customer_name: string;
  store_id: string;
  items: string[]; // product ids
  total: number;
  status: OrderStatus;
  assigned_rider_id: string | null;
  address: string;
  created_at: string;
  updated_at: string;
};

export type DbDelivery = {
  id: string;
  order_id: string;
  customer_name: string;
  rider_id: string | null;
  status: DeliveryStatus;
  eta: string;
  location: string;
  lat: number;
  lng: number;
  last_update: string;
  address: string;
  phone: string;
  total: number;
  created_at: string;
  updated_at: string;
};

export type DbSale = {
  id: string;
  date: string;
  customer_name: string;
  items: string[]; // product names
  total: number;
  payment_method: PaymentMethod;
  store_id: string;
  status: SaleStatus;
  created_at: string;
  updated_at: string;
};

// ── App-level types (used in components) ────────────────────────────────

export type StoreWithManager = DbStore & {
  manager: DbStaffUser | null;
};

export type ProductWithStock = DbProduct & {
  stock: Record<string, number>; // storeId -> quantity
};

export type OrderWithRelations = DbOrder & {
  store: DbStore | null;
  rider: DbStaffUser | null;
  day: "Today" | "Yesterday" | "Older";
};

export type DeliveryWithRider = DbDelivery & {
  rider: DbStaffUser | null;
  coordinates: { lat: number; lng: number };
};

export type SaleWithStore = DbSale & {
  store: DbStore | null;
};

// ── Dashboard summary types ──────────────────────────────────────────────

export type DashboardSummary = {
  totalRevenue: number;
  totalSales: number;
  pendingOrders: number;
  activeDeliveries: number;
  totalStock: number;
  revenueByStore: { store: DbStore; revenue: number; salesRevenue: number; orderCount: number }[];
  dailySales: { date: string; total: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  salesByMethod: { method: PaymentMethod; count: number; amount: number }[];
  topProducts: { name: string; total: number }[];
  recentOrders: OrderWithRelations[];
};

// ── Role-based access ────────────────────────────────────────────────────

export type StaffRole = "admin" | "store-manager" | "dispatch" |"rider";

export type RolePermissions = {
  canViewAllStores: boolean;
  canEditProducts: boolean;
  canDeleteRecords: boolean;
  canViewAllOrders: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canViewSales: boolean;
  canManageDeliveries: boolean;
  storeId: string | null; // null means all stores
};