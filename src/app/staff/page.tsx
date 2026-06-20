"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { canAccessStaffPortal, mapStaffPortalRole } from "@/lib/auth-utils";
import { useAppSelector } from "@/lib/redux-hooks";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────
interface Store {
  id: string;
  name: string;
  city: string;
  manager: string | null;
}

interface User {
  id: string;
  name: string;
  role: "admin" | "store-manager" | "rider" | "dispatch";
  storeId: string | null;
  status: "online" | "offline" | "delivering" | "available";
  phone: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  category: "juice" | "merch" | "pack";
  price: number;
  stock: Record<string, number>;
  sku: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  tickets: number;
  price: number;
  status: "active" | "planning" | "closed" | "cancelled";
  notes: string;
}

interface Pack {
  id: string;
  title: string;
  juices: number;
  merch: string;
  price: number;
  qty: number;
  description: string;
}

interface Order {
  id: string;
  customer: string;
  storeId: string;
  items: string[];
  total: number;
  status: "paid" | "preparing" | "on the way" | "delivered" | "cancelled";
  assignedRider: string | null;
  day: "Today" | "Yesterday";
  address: string;
}

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  riderId: string | null;
  riderName?: string;
  status: "pending" | "picked_up" | "on_the_way" | "delivered" | "cancelled";
  eta: string;
  location: string;
  coordinates: { lat: number; lng: number };
  lastUpdate: string;
  address: string;
  phone: string;
  total: number;
}

interface SalesRecord {
  id: string;
  date: string;
  customerName: string;
  items: string[];
  total: number;
  paymentMethod: "cash" | "mpesa" | "card";
  storeId: string;
  status: "completed" | "refunded" | "pending";
}

// ─── Colors ───────────────────────────────────────────────────────────────
const colors = {
  lime: "#b5e550",
  limeD: "#8cc920",
  dark: "#0f1a0a",
  darkCard: "#162010",
  darkBorder: "#253318",
  text: "#e8f5d0",
  textMuted: "#8aab6a",
  danger: "#ff5c5c",
  amber: "#ffb830",
  sky: "#38c2ff",
  purple: "#b98fff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const uid = (): string => Math.random().toString(36).slice(2, 9);

function exportCSV(rows: Record<string, any>[], filename: string): void {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? "")).join(",")),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

function exportJSON(data: any, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  );
  a.download = filename;
  a.click();
}

const ROLE_COLORS: Record<string, string> = {
  admin: colors.lime,
  "store-manager": colors.sky,
  rider: colors.amber,
  dispatch: colors.purple,
};

const STATUS_COLORS: Record<string, string> = {
  online: colors.lime,
  delivering: colors.amber,
  available: colors.sky,
  offline: colors.textMuted,
  paid: colors.lime,
  preparing: colors.amber,
  "on the way": colors.sky,
  delivered: colors.textMuted,
  active: colors.lime,
  planning: colors.amber,
  cancelled: colors.danger,
  closed: colors.textMuted,
};

// ─── Base Components ──────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ label: string; color?: string }> = ({ label, color }) => (
  <span
    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide"
    style={{
      backgroundColor: `${color || colors.lime}22`,
      color: color || colors.lime,
      border: `1px solid ${color || colors.lime}44`,
    }}
  >
    {label}
  </span>
);

const Btn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) => {
  const base = "rounded-lg font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sz = size === "sm" ? "px-3 py-1 text-xs" : "px-5 py-2 text-sm";
  const v = {
    primary: "bg-green-500 text-slate-900 hover:bg-green-400",
    ghost: "bg-transparent text-slate-200 border border-slate-700 hover:bg-slate-800",
    danger: "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sz} ${v[variant]} ${className}`}>
      {children}
    </button>
  );
};

const StaffInput: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}> = ({ value, onChange, placeholder, type = "text", className = "" }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${className}`}
  />
);

const StaffSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-green-500 ${className}`}
  >
    {children}
  </select>
);

const StaffTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none resize-y focus:border-green-500"
  />
);

const StaffLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
    {children}
  </label>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3">
    <StaffLabel>{label}</StaffLabel>
    {children}
  </div>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
    <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-200">{title}</span>
        <Btn onClick={onClose} variant="ghost" size="sm">✕</Btn>
      </div>
      {children}
    </div>
  </div>
);

const Stat: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({
  label, value, sub, color,
}) => (
  <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
    <div className="text-3xl font-extrabold" style={{ color: color || colors.lime }}>{value}</div>
    {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
  </div>
);

const TabBar: React.FC<{
  tabs: Array<{ id: string; label: string }>;
  active: string;
  setActive: (id: string) => void;
}> = ({ tabs, active, setActive }) => (
  <div className="flex flex-wrap gap-1.5">
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => setActive(t.id)}
        className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-150 ${active === t.id
            ? "bg-green-500 text-slate-900"
            : "border border-slate-700 text-slate-400 hover:bg-slate-800"
          }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

// ─── Chart Components ─────────────────────────────────────────────────────
const BarChart: React.FC<{ data: { l: string; v: number }[]; color?: string; height?: number }> = ({
  data, color = colors.lime, height = 120,
}) => {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div className="flex items-end gap-1.5 pt-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="text-xs text-slate-400">{d.v}</div>
          <div
            className="w-full rounded-t"
            style={{ height: Math.max(4, (d.v / max) * (height - 32)), backgroundColor: color, opacity: 0.85 }}
          />
          <div className="whitespace-nowrap text-xs text-slate-400">{d.l}</div>
        </div>
      ))}
    </div>
  );
};

const DonutChart: React.FC<{ segments: { l: string; v: number; color: string }[]; size?: number }> = ({
  segments, size = 100,
}) => {
  const total = segments.reduce((a, s) => a + s.v, 0) || 1;
  let offset = 0;
  const r = 40, cx = 50, cy = 50, stroke = 18, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.darkBorder} strokeWidth={stroke} />
      {segments.map((s, i) => {
        const pct = s.v / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const rotate = offset * 360 - 90;
        offset += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`} transform={`rotate(${rotate} ${cx} ${cy})`} strokeLinecap="butt" />
        );
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={colors.text}>{total}</text>
    </svg>
  );
};

// ─── Summary Tab ──────────────────────────────────────────────────────────
function SummaryTab({
  orders, products, users, events, packs, stores, sales, isLoading,
}: {
  orders: Order[]; products: Product[]; users: User[]; events: Event[];
  packs: Pack[]; stores: Store[]; sales: SalesRecord[]; isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((a, o) => a + o.total, 0);
  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const pendingOrders = orders.filter(o => ["paid", "preparing"].includes(o.status)).length;
  const activeDeliveries = orders.filter(o => o.status === "on the way").length;
  const totalStock = products.reduce((a, p) => a + Object.values(p.stock).reduce((b, v) => b + v, 0), 0);

  const salesByMethod = [
    { l: "M-Pesa", v: sales.filter(s => s.paymentMethod === "mpesa").length, color: colors.sky, amount: sales.filter(s => s.paymentMethod === "mpesa").reduce((a, s) => a + s.total, 0) },
    { l: "Cash", v: sales.filter(s => s.paymentMethod === "cash").length, color: colors.amber, amount: sales.filter(s => s.paymentMethod === "cash").reduce((a, s) => a + s.total, 0) },
    { l: "Card", v: sales.filter(s => s.paymentMethod === "card").length, color: colors.purple, amount: sales.filter(s => s.paymentMethod === "card").reduce((a, s) => a + s.total, 0) },
  ];

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split("T")[0];
  }).reverse();

  const dailySales = last7Days.map(date => ({
    l: date.slice(5),
    v: sales.filter(s => s.date === date).reduce((a, s) => a + s.total, 0),
  }));

  const ordersByStatus = [
    { l: "Paid", v: orders.filter(o => o.status === "paid").length, color: colors.lime },
    { l: "Prep", v: orders.filter(o => o.status === "preparing").length, color: colors.amber },
    { l: "Way", v: orders.filter(o => o.status === "on the way").length, color: colors.sky },
    { l: "Done", v: orders.filter(o => o.status === "delivered").length, color: colors.textMuted },
  ];

  const topProducts = products
    .map(p => ({ name: p.name, total: Object.values(p.stock).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={`KSh ${totalRevenue.toLocaleString()}`} sub={`Sales: KSh ${totalSales.toLocaleString()}`} color={colors.lime} />
        <Stat label="Pending Orders" value={pendingOrders} sub="Paid + preparing" color={colors.amber} />
        <Stat label="Active Deliveries" value={activeDeliveries} sub="On the way" color={colors.sky} />
        <Stat label="Total Stock" value={totalStock} sub="Units across stores" color={colors.purple} />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Daily Sales (KSh)</div>
          <BarChart data={dailySales} color={colors.lime} height={150} />
        </Card>
        <Card>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Orders by Status</div>
          <div className="flex items-center gap-4">
            <DonutChart segments={ordersByStatus} size={100} />
            <div className="flex flex-1 flex-col gap-2">
              {ordersByStatus.map(s => (
                <div key={s.l} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />{s.l}
                  </span>
                  <span className="font-bold text-slate-200">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Payment Methods</div>
          <div className="flex flex-col gap-2">
            {salesByMethod.map(method => (
              <div key={method.l} className="flex items-center justify-between border-b border-slate-800 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: method.color }} />
                  <span className="font-semibold text-slate-200">{method.l}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-500">KSh {method.amount.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{method.v} transactions</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Top Products by Stock</div>
          <div className="flex flex-col gap-2">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-slate-200">{product.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${topProducts[0].total > 0 ? (product.total / topProducts[0].total) * 100 : 0}%` }} />
                  </div>
                  <span className="font-semibold text-green-500">{product.total}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Revenue by Store</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stores.map(store => {
            const rev = orders.filter(o => o.storeId === store.id && o.status === "delivered").reduce((a, o) => a + o.total, 0);
            const saleRev = sales.filter(s => s.storeId === store.id).reduce((a, s) => a + s.total, 0);
            const count = orders.filter(o => o.storeId === store.id).length;
            return (
              <div key={store.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-xs text-slate-400">{store.name}</div>
                <div className="text-2xl font-extrabold text-green-500">KSh {rev.toLocaleString()}</div>
                <div className="mt-1 text-xs text-slate-400">{count} orders · KSh {saleRev.toLocaleString()} sales</div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Recent Orders</div>
        <div className="flex flex-col gap-2">
          {orders.slice(0, 4).map(order => (
            <div key={order.id} className="flex items-center justify-between border-b border-slate-800 py-2">
              <div>
                <div className="font-semibold text-slate-200">{order.customer}</div>
                <div className="text-xs text-slate-400">{order.id} · {order.day}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-500">KSh {order.total.toLocaleString()}</div>
                <Badge label={order.status} color={STATUS_COLORS[order.status]} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────
function OrdersTab({
  orders, onSave, onDelete, users, stores, isAdmin,
}: {
  orders: Order[];
  onSave: (order: Order) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  users: User[];
  stores: Store[];
  isAdmin: boolean;
}) {
  const [dayFilter, setDayFilter] = useState("Today");
  const [modal, setModal] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const riders = users.filter(u => u.role === "rider");
  const filtered = orders.filter(o => dayFilter === "All" || o.day === dayFilter);

  const openNew = () => setModal({ id: uid(), customer: "", storeId: stores[0]?.id || "", items: [], total: 0, status: "paid", assignedRider: null, day: "Today", address: "" });
  const openEdit = (o: Order) => setModal({ ...o });

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await onSave(modal);
    setSaving(false);
    setModal(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this order?")) await onDelete(id);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TabBar tabs={[{ id: "Today", label: "Today" }, { id: "Yesterday", label: "Yesterday" }, { id: "All", label: "All" }]} active={dayFilter} setActive={setDayFilter} />
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => exportCSV(filtered.map(o => ({ ...o, items: o.items.join("|") })), "orders.csv")}>↓ CSV</Btn>
          <Btn size="sm" variant="ghost" onClick={openNew}>+ New Order</Btn>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map(o => {
          const store = stores.find(s => s.id === o.storeId);
          const rider = users.find(u => u.id === o.assignedRider);
          return (
            <Card key={o.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200">{o.customer}</div>
                <div className="mt-0.5 text-xs text-slate-400">{o.id} · {store?.name || "–"} · {o.address}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge label={o.status} color={STATUS_COLORS[o.status]} />
                  <Badge label={rider ? `Rider: ${rider.name}` : "Unassigned"} color={rider ? colors.sky : colors.textMuted} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-green-500">KSh {o.total.toLocaleString()}</div>
                <div className="mb-2 text-xs text-slate-400">{o.day}</div>
                <div className="flex gap-1.5">
                  <Btn size="sm" variant="ghost" onClick={() => openEdit(o)}>Edit</Btn>
                  {isAdmin && <Btn size="sm" variant="danger" onClick={() => handleDelete(o.id)}>Del</Btn>}
                </div>
              </div>
            </Card>
          );
        })}
        {!filtered.length && <div className="py-10 text-center text-slate-400">No orders found</div>}
      </div>
      {modal && (
        <Modal title={orders.find(o => o.id === modal.id) ? "Edit Order" : "New Order"} onClose={() => setModal(null)}>
          <Field label="Customer Name"><StaffInput value={modal.customer} onChange={v => setModal({ ...modal, customer: v })} placeholder="Customer name" /></Field>
          <Field label="Address"><StaffInput value={modal.address} onChange={v => setModal({ ...modal, address: v })} placeholder="Delivery address" /></Field>
          <Field label="Store"><StaffSelect value={modal.storeId} onChange={v => setModal({ ...modal, storeId: v })}>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</StaffSelect></Field>
          <Field label="Status"><StaffSelect value={modal.status} onChange={v => setModal({ ...modal, status: v as Order["status"] })}>{["paid", "preparing", "on the way", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}</StaffSelect></Field>
          <Field label="Total (KSh)"><StaffInput type="number" value={modal.total} onChange={v => setModal({ ...modal, total: Number(v) })} /></Field>
          <Field label="Assign Rider">
            <StaffSelect value={modal.assignedRider || ""} onChange={v => setModal({ ...modal, assignedRider: v || null })}>
              <option value="">Unassigned</option>
              {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </StaffSelect>
          </Field>
          <Field label="Day"><StaffSelect value={modal.day} onChange={v => setModal({ ...modal, day: v as Order["day"] })}>{["Today", "Yesterday"].map(d => <option key={d} value={d}>{d}</option>)}</StaffSelect></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Deliveries Tab ───────────────────────────────────────────────────────
function DeliveriesTab({
  deliveries, onStatusChange, onAssignRider, users, activeRole, isAdmin,
}: {
  deliveries: Delivery[];
  onStatusChange: (id: string, status: Delivery["status"]) => Promise<void>;
  onAssignRider: (deliveryId: string, riderId: string) => Promise<void>;
  users: User[];
  activeRole: string;
  isAdmin: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Delivery | null>(deliveries[0] || null);
  const [showDetails, setShowDetails] = useState(false);

  const currentUser = users.find(u => u.role === activeRole);
  const mine = activeRole !== "admin" ? deliveries.filter(d => d.riderId === currentUser?.id) : deliveries;
  const filtered = mine.filter(d => statusFilter === "all" || d.status === statusFilter);

  const statusColor = (s: string) => ({ pending: colors.amber, picked_up: colors.sky, on_the_way: colors.lime, delivered: colors.textMuted, cancelled: colors.danger }[s] || colors.textMuted);
  const statusLabel = (s: string) => ({ pending: "Pending", picked_up: "Picked Up", on_the_way: "On The Way", delivered: "Delivered", cancelled: "Cancelled" }[s] || s);

  const availableRiders = users.filter(u => u.role === "rider" && u.status !== "offline");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabBar tabs={[{ id: "all", label: "All" }, { id: "pending", label: "Pending" }, { id: "picked_up", label: "Picked Up" }, { id: "on_the_way", label: "On The Way" }, { id: "delivered", label: "Delivered" }]} active={statusFilter} setActive={setStatusFilter} />
        {isAdmin && <Btn size="sm" onClick={() => exportCSV(deliveries, "deliveries.csv")}>↓ Export CSV</Btn>}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{isAdmin ? "All Deliveries" : "My Deliveries"}</div>
          <div className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
            {filtered.map(d => (
              <div key={d.id} onClick={() => setSelected(d)} className={`cursor-pointer rounded-xl border p-3 transition-all duration-150 ${selected?.id === d.id ? "border-green-500 bg-green-500/10" : "border-slate-700"}`}>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{d.customerName}</div>
                    <div className="text-xs text-slate-400">Order: {d.orderId}</div>
                  </div>
                  <Badge label={statusLabel(d.status)} color={statusColor(d.status)} />
                </div>
                <div className="mb-1 text-xs text-slate-400">Rider: {d.riderName || "Unassigned"}</div>
                <div className="font-semibold text-green-500">KSh {d.total.toLocaleString()}</div>
                <div className="mt-1 text-xs text-slate-400">ETA: {d.eta} • {d.lastUpdate}</div>
              </div>
            ))}
            {!filtered.length && <div className="py-8 text-center text-slate-400">No deliveries found</div>}
          </div>
        </Card>
        {selected && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-bold text-slate-200">Delivery Details</div>
              <Btn size="sm" variant="ghost" onClick={() => setShowDetails(!showDetails)}>{showDetails ? "Hide" : "Show Ride Details"}</Btn>
            </div>
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
              <iframe title="Map" src={`https://maps.google.com/maps?q=${selected.coordinates.lat},${selected.coordinates.lng}&z=15&output=embed`} className="h-64 w-full border-0" allowFullScreen loading="lazy" />
            </div>
            <div className="mb-4 grid gap-2">
              <div><StaffLabel>Customer</StaffLabel><div className="text-sm text-slate-200">{selected.customerName}</div></div>
              <div><StaffLabel>Address</StaffLabel><div className="text-sm text-slate-200">{selected.address}</div></div>
              <div><StaffLabel>Phone</StaffLabel><div className="text-sm text-slate-200">{selected.phone}</div></div>
              <div><StaffLabel>Location</StaffLabel><div className="text-sm text-green-500">{selected.location}</div></div>
              <div><StaffLabel>Last Update</StaffLabel><div className="text-sm text-slate-400">{selected.lastUpdate}</div></div>
            </div>
            {isAdmin && selected.status !== "delivered" && selected.status !== "cancelled" && (
              <div className="mt-4">
                <StaffLabel>Update Status</StaffLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["pending", "picked_up", "on_the_way", "delivered"] as Delivery["status"][]).map(s => (
                    <Btn key={s} size="sm" variant={selected.status === s ? "primary" : "ghost"} onClick={() => onStatusChange(selected.id, s)}>{statusLabel(s)}</Btn>
                  ))}
                </div>
              </div>
            )}
            {isAdmin && !selected.riderId && (
              <div className="mt-4">
                <StaffLabel>Assign Rider</StaffLabel>
                <StaffSelect value="" onChange={v => v && onAssignRider(selected.id, v)} className="mt-2">
                  <option value="">Select a rider...</option>
                  {availableRiders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </StaffSelect>
              </div>
            )}
            {showDetails && (
              <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-lg font-bold text-slate-200">Ride Details</div>
                  <Btn size="sm" variant="ghost" onClick={() => setShowDetails(false)}>✕</Btn>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {[["Order ID", selected.orderId], ["Customer", selected.customerName], ["Rider", selected.riderName || "Not assigned"], ["Status", statusLabel(selected.status)], ["Total", `KSh ${selected.total.toLocaleString()}`], ["Address", selected.address], ["Phone", selected.phone], ["ETA", selected.eta]].map(([k, v]) => (
                    <div key={k}><strong className="text-slate-400">{k}:</strong> <span className="text-slate-200">{v}</span></div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────────────────
function SalesTab({ sales, stores }: { sales: SalesRecord[]; stores: Store[] }) {
  const [dateFilter, setDateFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");

  const filtered = sales.filter(s => (dateFilter === "all" || s.date === dateFilter) && (storeFilter === "all" || s.storeId === storeFilter));
  const sorted = [...filtered].sort((a, b) => sortBy === "date" ? new Date(b.date).getTime() - new Date(a.date).getTime() : b.total - a.total);
  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const uniqueDates = ["all", ...new Set(sales.map(s => s.date))];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Total Revenue" value={`KSh ${totalRevenue.toLocaleString()}`} color={colors.lime} />
        <Stat label="Total Orders" value={filtered.length} color={colors.sky} />
        <Stat label="Average Order" value={`KSh ${Math.round(totalRevenue / (filtered.length || 1)).toLocaleString()}`} color={colors.purple} />
      </div>
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1"><StaffLabel>Filter by Date</StaffLabel><StaffSelect value={dateFilter} onChange={setDateFilter}>{uniqueDates.map(d => <option key={d} value={d}>{d === "all" ? "All Dates" : d}</option>)}</StaffSelect></div>
          <div className="flex-1"><StaffLabel>Filter by Store</StaffLabel><StaffSelect value={storeFilter} onChange={setStoreFilter}><option value="all">All Stores</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</StaffSelect></div>
          <div className="flex-1"><StaffLabel>Sort By</StaffLabel><StaffSelect value={sortBy} onChange={v => setSortBy(v as "date" | "total")}><option value="date">Date (Newest)</option><option value="total">Total (Highest)</option></StaffSelect></div>
          <Btn size="sm" onClick={() => exportCSV(filtered, "sales-report.csv")}>↓ Export</Btn>
        </div>
      </Card>
      <Card>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Sales Transactions</div>
        <div className="flex flex-col gap-2">
          {sorted.map(sale => {
            const store = stores.find(s => s.id === sale.storeId);
            return (
              <div key={sale.id} className="rounded-xl border border-slate-700 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-200">{sale.customerName}</div>
                    <div className="text-xs text-slate-400">{sale.id} • {sale.date}</div>
                    <div className="mt-1 text-xs text-slate-400">{sale.items.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-green-500">KSh {sale.total.toLocaleString()}</div>
                    <div className="mt-1 flex gap-1.5">
                      <Badge label={sale.paymentMethod} color={sale.paymentMethod === "mpesa" ? colors.sky : colors.amber} />
                      <Badge label={sale.status} color={sale.status === "completed" ? colors.lime : colors.danger} />
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{store?.name || "Unknown Store"}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────
function ProductsTab({
  products, onSave, onDelete, stores, isAdmin,
}: {
  products: Product[];
  onSave: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  stores: Store[];
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<Product | null>(null);
  const [catFilter, setCatFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const openNew = () => { const stock: Record<string, number> = {}; stores.forEach(s => (stock[s.id] = 0)); setModal({ id: uid(), name: "", category: "juice", price: 0, stock, sku: "" }); };
  const openEdit = (p: Product) => setModal({ ...p, stock: { ...p.stock } });

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await onSave(modal);
    setSaving(false);
    setModal(null);
  };

  const cats = ["all", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => catFilter === "all" || p.category === catFilter);
 
  
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TabBar tabs={cats.map(c => ({ id: c, label: c }))} active={catFilter} setActive={setCatFilter} />
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => exportCSV(filtered.map(p => ({ ...p, stock: JSON.stringify(p.stock) })), "products.csv")}>↓ CSV</Btn>
          <Btn size="sm" variant="ghost" onClick={openNew}>+ New Product</Btn>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => {
          const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
          return (
            <Card key={p.id}>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <Badge label={p.category} color={p.category === "juice" ? colors.lime : colors.purple} />
                  <div className="mt-2 font-bold text-slate-200">{p.name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">SKU: {p.sku}</div>
                </div>
                <div className="text-lg font-extrabold text-green-500">KSh {p.price.toLocaleString()}</div>
              </div>
              <div className="mt-2 border-t border-slate-700 pt-2">
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Stock by store</div>
                <div className="flex flex-col gap-1">
                  {stores.map(s => (
                    <div key={s.id} className="flex justify-between text-xs">
                      <span className="text-slate-400">{s.name}</span>
                      <span className="font-semibold text-slate-200">{p.stock[s.id] ?? 0} units</span>
                    </div>
                  ))}
                  <div className="mt-1 flex justify-between border-t border-slate-700 pt-1 text-xs">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold text-green-500">{totalStock}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Btn size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Btn>
                {isAdmin && <Btn size="sm" variant="danger" onClick={() => window.confirm("Delete?") && onDelete(p.id)}>Delete</Btn>}
              </div>
            </Card>
          );
        })}
      </div>
      {modal && (
        <Modal title={products.find(p => p.id === modal.id) ? "Edit Product" : "Add Product"} onClose={() => setModal(null)}>
          <Field label="Product Name"><StaffInput value={modal.name} onChange={v => setModal({ ...modal, name: v })} placeholder="Product name" /></Field>
          <Field label="SKU"><StaffInput value={modal.sku} onChange={v => setModal({ ...modal, sku: v })} placeholder="e.g. JW-JUC-003" /></Field>
          <Field label="Category"><StaffSelect value={modal.category} onChange={v => setModal({ ...modal, category: v as Product["category"] })}>{["juice", "merch", "pack"].map(c => <option key={c} value={c}>{c}</option>)}</StaffSelect></Field>
          <Field label="Price (KSh)"><StaffInput type="number" value={modal.price} onChange={v => setModal({ ...modal, price: Number(v) })} /></Field>
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Stock per store</div>
          {stores.map(s => (
            <Field key={s.id} label={s.name}><StaffInput type="number" value={modal.stock[s.id] ?? 0} onChange={v => setModal({ ...modal, stock: { ...modal.stock, [s.id]: Number(v) } })} /></Field>
          ))}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────
function EventsTab({
  events, onSave, onDelete, isAdmin,
}: {
  events: Event[];
  onSave: (event: Event) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setModal({ id: uid(), title: "", date: new Date().toISOString().split("T")[0], venue: "", tickets: 0, price: 0, status: "planning", notes: "" });
  const openEdit = (e: Event) => setModal({ ...e });

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await onSave(modal);
    setSaving(false);
    setModal(null);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Btn size="sm" onClick={() => exportCSV(events, "events.csv")}>↓ CSV</Btn>
        <Btn size="sm" variant="ghost" onClick={openNew}>+ New Event</Btn>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {events.map(e => (
          <Card key={e.id}>
            <div className="mb-2 flex items-start justify-between">
              <Badge label={e.status} color={STATUS_COLORS[e.status]} />
              <div className="text-xs text-slate-400">{e.date}</div>
            </div>
            <div className="font-bold text-slate-200">{e.title}</div>
            <div className="mb-3 text-xs text-slate-400">📍 {e.venue}</div>
            <div className="mb-3 flex gap-3">
              <div><div className="text-xs text-slate-400">Tickets</div><div className="font-bold text-slate-200">{e.tickets}</div></div>
              <div className="font-bold text-green-500">{formatPrice(e.price)}</div>
            </div>
            {e.notes && <div className="mb-3 rounded-lg bg-slate-800 p-2 text-xs text-slate-400">{e.notes}</div>}
            <div className="flex gap-2">
              <Btn size="sm" variant="ghost" onClick={() => openEdit(e)}>Edit</Btn>
              {isAdmin && <Btn size="sm" variant="danger" onClick={() => window.confirm("Delete?") && onDelete(e.id)}>Delete</Btn>}
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title={events.find(e => e.id === modal.id) ? "Edit Event" : "Create Event"} onClose={() => setModal(null)}>
          <Field label="Event Title"><StaffInput value={modal.title} onChange={v => setModal({ ...modal, title: v })} placeholder="Event name" /></Field>
          <Field label="Date"><StaffInput type="date" value={modal.date} onChange={v => setModal({ ...modal, date: v })} /></Field>
          <Field label="Venue"><StaffInput value={modal.venue} onChange={v => setModal({ ...modal, venue: v })} placeholder="Venue / location" /></Field>
          <Field label="Total Tickets"><StaffInput type="number" value={modal.tickets} onChange={v => setModal({ ...modal, tickets: Number(v) })} /></Field>
          <Field label="Ticket Price (KSh)"><StaffInput type="number" value={modal.price} onChange={v => setModal({ ...modal, price: Number(v) })} /></Field>
          <Field label="Status"><StaffSelect value={modal.status} onChange={v => setModal({ ...modal, status: v as Event["status"] })}>{["planning", "active", "closed", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}</StaffSelect></Field>
          <Field label="Notes"><StaffTextarea value={modal.notes} onChange={v => setModal({ ...modal, notes: v })} placeholder="Event notes..." /></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Packs Tab ────────────────────────────────────────────────────────────
function PacksTab({
  packs, onSave, onDelete, isAdmin,
}: {
  packs: Pack[];
  onSave: (pack: Pack) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<Pack | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setModal({ id: uid(), title: "", juices: 0, merch: "", price: 0, qty: 0, description: "" });
  const openEdit = (p: Pack) => setModal({ ...p });

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await onSave(modal);
    setSaving(false);
    setModal(null);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Btn size="sm" onClick={() => exportCSV(packs, "party-packs.csv")}>↓ CSV</Btn>
        <Btn size="sm" variant="ghost" onClick={openNew}>+ New Pack</Btn>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map(p => (
          <Card key={p.id} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-3xl bg-green-500/10" />
            <div className="font-extrabold text-slate-200">{p.title}</div>
            <div className="mb-3 text-2xl font-extrabold text-green-500">KSh {p.price.toLocaleString()}</div>
            <div className="mb-2 flex gap-3">
              <div><div className="text-xs uppercase text-slate-400">Juices</div><div className="font-bold text-slate-200">{p.juices}</div></div>
              <div><div className="text-xs uppercase text-slate-400">Merch</div><div className="text-sm font-bold text-slate-200">{p.merch}</div></div>
              <div><div className="text-xs uppercase text-slate-400">In stock</div><div className={`font-bold ${p.qty < 5 ? "text-red-400" : "text-slate-200"}`}>{p.qty}</div></div>
            </div>
            {p.description && <div className="mb-3 text-xs text-slate-400">{p.description}</div>}
            <div className="flex gap-2">
              <Btn size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Btn>
              {isAdmin && <Btn size="sm" variant="danger" onClick={() => window.confirm("Delete?") && onDelete(p.id)}>Delete</Btn>}
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title={packs.find(p => p.id === modal.id) ? "Edit Party Pack" : "Create Party Pack"} onClose={() => setModal(null)}>
          <Field label="Pack Name"><StaffInput value={modal.title} onChange={v => setModal({ ...modal, title: v })} placeholder="e.g. VIP Pack" /></Field>
          <Field label="Price (KSh)"><StaffInput type="number" value={modal.price} onChange={v => setModal({ ...modal, price: Number(v) })} /></Field>
          <Field label="Number of Juices"><StaffInput type="number" value={modal.juices} onChange={v => setModal({ ...modal, juices: Number(v) })} /></Field>
          <Field label="Merch Included"><StaffInput value={modal.merch} onChange={v => setModal({ ...modal, merch: v })} placeholder="e.g. Hoodie x1" /></Field>
          <Field label="Quantity in Stock"><StaffInput type="number" value={modal.qty} onChange={v => setModal({ ...modal, qty: Number(v) })} /></Field>
          <Field label="Description"><StaffTextarea value={modal.description} onChange={v => setModal({ ...modal, description: v })} placeholder="Pack description..." /></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────
function UsersTab({
  users, onSave, onDelete, stores, isAdmin,
}: {
  users: User[];
  onSave: (user: User) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  stores: Store[];
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("rider");
  const [saving, setSaving] = useState(false);

  const openNew = () => setModal({ id: uid(), name: "", role: "rider", storeId: stores[0]?.id || null, status: "available", phone: "", email: "" });
  const openEdit = (u: User) => setModal({ ...u });

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await onSave(modal);
    setSaving(false);
    setModal(null);
  };

  const sendInvite = () => {
    if (inviteEmail) {
      alert(`Invitation sent to ${inviteEmail} with role: ${inviteRole}`);
      setInviteEmail("");
      setShowInvite(false);
    }
  };

  const roles = ["all", "admin", "store-manager", "rider", "dispatch"];
  const filtered = users.filter(u => roleFilter === "all" || u.role === roleFilter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TabBar tabs={roles.map(r => ({ id: r, label: r }))} active={roleFilter} setActive={setRoleFilter} />
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => exportCSV(filtered, "users.csv")}>↓ CSV</Btn>
          <Btn size="sm" variant="ghost" onClick={() => setShowInvite(true)}>✉ Invite</Btn>
          {isAdmin && <Btn size="sm" variant="ghost" onClick={openNew}>+ New User</Btn>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(u => {
          const store = stores.find(s => s.id === u.storeId);
          const initials = u.name.split(" ").map(n => n[0]).slice(0, 2).join("");
          return (
            <Card key={u.id}>
              <div className="mb-3 flex gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-bold"
                  style={{ backgroundColor: (ROLE_COLORS[u.role] || colors.textMuted) + "22", color: ROLE_COLORS[u.role] || colors.textMuted }}>
                  {initials}
                </div>
                <div>
                  <div className="font-bold text-slate-200">{u.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge label={u.role} color={ROLE_COLORS[u.role]} />
                    <Badge label={u.status} color={STATUS_COLORS[u.status]} />
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400">📍 {store?.name || "No store"}</div>
              <div className="text-xs text-slate-400">📱 {u.phone}</div>
              <div className="mb-3 text-xs text-slate-400">✉ {u.email}</div>
              <div className="flex gap-2">
                <Btn size="sm" variant="ghost" onClick={() => openEdit(u)}>Edit</Btn>
                {isAdmin && <Btn size="sm" variant="danger" onClick={() => window.confirm("Delete?") && onDelete(u.id)}>Delete</Btn>}
              </div>
            </Card>
          );
        })}
      </div>
      {modal && (
        <Modal title={users.find(u => u.id === modal.id) ? "Edit User" : "Add User"} onClose={() => setModal(null)}>
          <Field label="Full Name"><StaffInput value={modal.name} onChange={v => setModal({ ...modal, name: v })} placeholder="Full name" /></Field>
          <Field label="Email"><StaffInput value={modal.email} onChange={v => setModal({ ...modal, email: v })} placeholder="email@jabawaba.co.ke" /></Field>
          <Field label="Phone"><StaffInput value={modal.phone} onChange={v => setModal({ ...modal, phone: v })} placeholder="07xx..." /></Field>
          <Field label="Role"><StaffSelect value={modal.role} onChange={v => setModal({ ...modal, role: v as User["role"] })}>{["admin", "store-manager", "rider", "dispatch"].map(r => <option key={r} value={r}>{r}</option>)}</StaffSelect></Field>
          <Field label="Assigned Store"><StaffSelect value={modal.storeId || ""} onChange={v => setModal({ ...modal, storeId: v || null })}><option value="">No store</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</StaffSelect></Field>
          <Field label="Status"><StaffSelect value={modal.status} onChange={v => setModal({ ...modal, status: v as User["status"] })}>{["online", "available", "delivering", "offline"].map(s => <option key={s} value={s}>{s}</option>)}</StaffSelect></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Btn>
          </div>
        </Modal>
      )}
      {showInvite && (
        <Modal title="Invite Team Member" onClose={() => { setShowInvite(false); setInviteEmail(""); }}>
          <Field label="Email Address"><StaffInput value={inviteEmail} onChange={setInviteEmail} placeholder="colleague@jabawaba.co.ke" type="email" /></Field>
          <Field label="Role"><StaffSelect value={inviteRole} onChange={setInviteRole}><option value="rider">Rider</option><option value="store-manager">Store Manager</option><option value="dispatch">Dispatch Staff</option></StaffSelect></Field>
          <div className="mb-4 rounded-lg bg-slate-800 p-3 text-xs text-slate-200">You've been invited to join Jaba Waba Staff Portal. Click the link to set up your account.</div>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => { setShowInvite(false); setInviteEmail(""); }}>Cancel</Btn>
            <Btn onClick={sendInvite}>Send Invitation</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Stores Tab ───────────────────────────────────────────────────────────
function StoresTab({
  stores, onSave, onDelete, users, isAdmin,
}: {
  stores: Store[];
  onSave: (store: Store) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  users: User[];
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<Store | null>(null);
  const [saving, setSaving] = useState(false);
  const managers = users.filter(u => u.role === "store-manager");

  const openNew = () => setModal({ id: uid(), name: "", city: "", manager: "" });
  const openEdit = (s: Store) => setModal({ ...s });

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await onSave(modal);
    setSaving(false);
    setModal(null);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Btn size="sm" onClick={() => exportCSV(stores, "stores.csv")}>↓ CSV</Btn>
        {isAdmin && <Btn size="sm" variant="ghost" onClick={openNew}>+ New Store</Btn>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stores.map(s => {
          const manager = users.find(u => u.id === s.manager);
          const riders = users.filter(u => u.storeId === s.id && u.role === "rider");
          return (
            <Card key={s.id}>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="font-extrabold text-slate-200">{s.name}</div>
                  <div className="text-xs text-slate-400">📍 {s.city}</div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 text-lg">🏪</div>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <div className="text-xs text-slate-400">Manager: <span className="font-semibold text-slate-200">{manager?.name || "–"}</span></div>
                <div className="text-xs text-slate-400">Riders: <span className="font-semibold text-slate-200">{riders.length}</span> assigned</div>
              </div>
              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <Btn size="sm" variant="ghost" onClick={() => openEdit(s)}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => window.confirm("Delete?") && onDelete(s.id)}>Delete</Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {modal && (
        <Modal title={stores.find(s => s.id === modal.id) ? "Edit Store" : "Add Store"} onClose={() => setModal(null)}>
          <Field label="Store Name"><StaffInput value={modal.name} onChange={v => setModal({ ...modal, name: v })} placeholder="e.g. Jaba Coast" /></Field>
          <Field label="City"><StaffInput value={modal.city} onChange={v => setModal({ ...modal, city: v })} placeholder="City" /></Field>
          <Field label="Manager"><StaffSelect value={modal.manager || ""} onChange={v => setModal({ ...modal, manager: v || "" })}><option value="">No manager</option>{managers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</StaffSelect></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "Free";
  if (price === 0) return "Free";
  return `KSh ${price.toLocaleString()}`;
};

// ─── Root StaffDashboard ──────────────────────────────────────────────────
export default function StaffDashboard() {
  const router = useRouter();
  const shopUser = useAppSelector((state) => state.shop.user);
  const supabase = useMemo(() => createClient(), []);

  const [authChecked, setAuthChecked] = useState(false);
  const [activeRole, setActiveRole] = useState<"admin" | "store-manager" | "dispatch">("admin");
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [
        { data: storesData },
        { data: usersData },
        { data: productsData },
        { data: stockData },
        { data: ordersData },
        { data: deliveriesData },
        { data: salesData },
        { data: eventsData },
        { data: packsData },
      ] = await Promise.all([
        supabase.from("stores").select("*"),
        supabase.from("staff_users").select("*"),
        supabase.from("products").select("*"),
        supabase.from("product_stock").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("deliveries").select("*"),
        supabase.from("sales").select("*").order("date", { ascending: false }),
        supabase.from("events").select("*"),
        supabase.from("party_packs").select("*"),
      ]);

      if (storesData) setStores(storesData);
      if (usersData) setUsers(usersData.map((u: any) => ({ ...u, storeId: u.store_id })));

      if (productsData) {
        setProducts(productsData.map((p: any) => ({
          ...p,
          stock: (stockData ?? [])
            .filter((s: any) => s.product_id === p.id)
            .reduce((acc: Record<string, number>, s: any) => ({ ...acc, [s.store_id]: s.quantity }), {}),
        })));
      }

      if (ordersData) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        setOrders(ordersData.map((o: any) => ({
          ...o,
          customer: o.customer_name,
          storeId: o.store_id,
          assignedRider: o.assigned_rider_id,
          day: new Date(o.created_at).toDateString() === today ? "Today"
            : new Date(o.created_at).toDateString() === yesterday ? "Yesterday"
              : "Yesterday",
        })));
      }

      if (deliveriesData) {
        setDeliveries(deliveriesData.map((d: any) => ({
          ...d,
          orderId: d.order_id,
          customerName: d.customer_name,
          riderId: d.rider_id,
          lastUpdate: d.last_update,
          coordinates: { lat: Number(d.lat), lng: Number(d.lng) },
        })));
      }

      if (salesData) {
        setSales(salesData.map((s: any) => ({
          ...s,
          customerName: s.customer_name,
          paymentMethod: s.payment_method,
          storeId: s.store_id,
        })));
      }

      if (eventsData) setEvents(eventsData);
      if (packsData) setPacks(packsData);
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!shopUser) { router.replace("/auth/signin?next=/staff"); return; }
    if (!canAccessStaffPortal(shopUser.role)) { router.replace("/"); return; }
    setActiveRole(mapStaffPortalRole(shopUser.role));
    setAuthChecked(true);
    fetchAll();
  }, [shopUser, router, fetchAll]);

  // ── CRUD helpers ────────────────────────────────────────────────────
  const saveOrder = useCallback(async (order: Order) => {
    const payload = { customer_name: order.customer, store_id: order.storeId, items: order.items, total: order.total, status: order.status, assigned_rider_id: order.assignedRider, address: order.address };
    const existing = orders.find(o => o.id === order.id);
    if (existing) { await supabase.from("orders").update(payload).eq("id", order.id); }
    else { await supabase.from("orders").insert({ ...payload }); }
    await fetchAll();
  }, [supabase, orders, fetchAll]);

  const removeOrder = useCallback(async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
    setOrders(prev => prev.filter(o => o.id !== id));
  }, [supabase]);

  const changeOrderStatus = useCallback(async (id: string, status: Order["status"]) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, [supabase]);

  const changeDeliveryStatus = useCallback(async (id: string, status: Delivery["status"]) => {
    await supabase.from("deliveries").update({ status, last_update: "Just now" }).eq("id", id);
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status, lastUpdate: "Just now" } : d));
  }, [supabase]);

  const assignRider = useCallback(async (deliveryId: string, riderId: string) => {
    const rider = users.find(u => u.id === riderId);
    await supabase.from("deliveries").update({ rider_id: riderId, status: "pending" }).eq("id", deliveryId);
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, riderId, riderName: rider?.name, status: "pending" } : d));
  }, [supabase, users]);

  const saveProduct = useCallback(async (product: Product) => {
    const { stock, ...rest } = product;
    const existing = products.find(p => p.id === product.id);
    let productId = product.id;
    if (existing) { await supabase.from("products").update(rest).eq("id", product.id); }
    else { const { data } = await supabase.from("products").insert(rest).select().single(); if (data) productId = data.id; }
    const stockRows = Object.entries(stock).map(([store_id, quantity]) => ({ product_id: productId, store_id, quantity }));
    await supabase.from("product_stock").upsert(stockRows, { onConflict: "product_id,store_id" });
    await fetchAll();
  }, [supabase, products, fetchAll]);

  const removeProduct = useCallback(async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, [supabase]);

  const saveEvent = useCallback(async (event: Event) => {
    const existing = events.find(e => e.id === event.id);
    if (existing) { await supabase.from("events").update(event).eq("id", event.id); }
    else { await supabase.from("events").insert(event); }
    await fetchAll();
  }, [supabase, events, fetchAll]);

  const removeEvent = useCallback(async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }, [supabase]);

  const savePack = useCallback(async (pack: Pack) => {
    const existing = packs.find(p => p.id === pack.id);
    if (existing) { await supabase.from("party_packs").update(pack).eq("id", pack.id); }
    else { await supabase.from("party_packs").insert(pack); }
    await fetchAll();
  }, [supabase, packs, fetchAll]);

  const removePack = useCallback(async (id: string) => {
    await supabase.from("party_packs").delete().eq("id", id);
    setPacks(prev => prev.filter(p => p.id !== id));
  }, [supabase]);

  const saveUser = useCallback(async (user: User) => {
    const payload = { name: user.name, role: user.role, store_id: user.storeId, status: user.status, phone: user.phone, email: user.email };
    const existing = users.find(u => u.id === user.id);
    if (existing) { await supabase.from("staff_users").update(payload).eq("id", user.id); }
    else { await supabase.from("staff_users").insert(payload); }
    await fetchAll();
  }, [supabase, users, fetchAll]);

  const removeUser = useCallback(async (id: string) => {
    await supabase.from("staff_users").delete().eq("id", id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }, [supabase]);

  const saveStore = useCallback(async (store: Store) => {
    const payload = { name: store.name, city: store.city, manager_id: store.manager || null };
    const existing = stores.find(s => s.id === store.id);
    if (existing) { await supabase.from("stores").update(payload).eq("id", store.id); }
    else { await supabase.from("stores").insert(payload); }
    await fetchAll();
  }, [supabase, stores, fetchAll]);

  const removeStore = useCallback(async (id: string) => {
    await supabase.from("stores").delete().eq("id", id);
    setStores(prev => prev.filter(s => s.id !== id));
  }, [supabase]);

  const isAdmin = activeRole === "admin";

  const tabs = [
    { id: "summary", label: "📊 Summary" },
    { id: "orders", label: "📦 Orders" },
    { id: "deliveries", label: "🚚 Deliveries" },
    { id: "sales", label: "💰 Sales" },
    { id: "products", label: "🧃 Products" },
    { id: "events", label: "🎪 Events" },
    { id: "packs", label: "🎁 Packs" },
    { id: "users", label: "👤 Users" },
    ...(isAdmin ? [{ id: "stores", label: "🏪 Stores" }] : []),
  ];

  if (!authChecked || !shopUser || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-lg font-bold text-white">🧃</div>
              <div>
                <span className="text-lg font-black tracking-tight text-green-500">JABA WABA</span>
                <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-400">Staff Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">{shopUser.name}</p>
                <p className="text-xs text-slate-400">{shopUser.email}</p>
              </div>
              <span className="rounded-lg bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 capitalize">{shopUser.role}</span>
              {isAdmin && <Btn size="sm" onClick={() => exportJSON({ orders, products, events, packs, users, stores, deliveries, sales }, "jaba-waba-export.json")}>↓ Export All</Btn>}
              <Btn size="sm" variant="ghost" onClick={fetchAll}>↺ Refresh</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-0.5 overflow-x-auto py-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-semibold transition-all duration-150 ${activeTab === t.id ? "border-b-2 border-green-500 bg-green-500/10 text-green-500" : "text-slate-400 hover:bg-slate-800"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "summary" && <SummaryTab orders={orders} products={products} users={users} events={events} packs={packs} stores={stores} sales={sales} isLoading={loading} />}
        {activeTab === "orders" && <OrdersTab orders={orders} onSave={saveOrder} onDelete={removeOrder} users={users} stores={stores} isAdmin={isAdmin} />}
        {activeTab === "deliveries" && <DeliveriesTab deliveries={deliveries} onStatusChange={changeDeliveryStatus} onAssignRider={assignRider} users={users} activeRole={activeRole} isAdmin={isAdmin} />}
        {activeTab === "sales" && <SalesTab sales={sales} stores={stores} />}
        {activeTab === "products" && <ProductsTab products={products} onSave={saveProduct} onDelete={removeProduct} stores={stores} isAdmin={isAdmin} />}
        {activeTab === "events" && <EventsTab events={events} onSave={saveEvent} onDelete={removeEvent} isAdmin={isAdmin} />}
        {activeTab === "packs" && <PacksTab packs={packs} onSave={savePack} onDelete={removePack} isAdmin={isAdmin} />}
        {activeTab === "users" && <UsersTab users={users} onSave={saveUser} onDelete={removeUser} stores={stores} isAdmin={isAdmin} />}
        {activeTab === "stores" && isAdmin && <StoresTab stores={stores} onSave={saveStore} onDelete={removeStore} users={users} isAdmin={isAdmin} />}
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Jaba Waba Staff Portal · {new Date().toLocaleDateString("en-KE")}
      </div>
    </div>
  );
}