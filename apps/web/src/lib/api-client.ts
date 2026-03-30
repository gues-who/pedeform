import type {
  AdminKpis,
  FinanceiroDay,
  Order,
  OrderItem,
  OrderStatus,
  SharedMenuCategory,
  SharedMenuItem,
  Table,
} from "@pedeform/shared";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export function fetchMenuCategories() {
  return apiFetch<SharedMenuCategory[]>("/menu/categories");
}

export function fetchMenuItems(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<SharedMenuItem[]>(`/menu/items${qs}`);
}

// ─── Mesas ───────────────────────────────────────────────────────────────────

export function fetchTables() {
  return apiFetch<Table[]>("/tables");
}

export function fetchTable(id: string) {
  return apiFetch<Table>(`/tables/${encodeURIComponent(id)}`);
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export function fetchOrdersByMesa(mesaId: string) {
  return apiFetch<Order[]>(`/mesas/${encodeURIComponent(mesaId)}/orders`);
}

export function fetchOrder(orderId: string) {
  return apiFetch<Order>(`/orders/${encodeURIComponent(orderId)}`);
}

export function createOrder(mesaId: string, items: OrderItem[]) {
  return apiFetch<Order>(`/mesas/${encodeURIComponent(mesaId)}/orders`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  return apiFetch<Order>(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function fetchAdminOverview(): Promise<{
  kpis: AdminKpis;
  tables: Table[];
  financeiro: FinanceiroDay[];
}> {
  return apiFetch("/admin/overview");
}

export function fetchAdminKpis() {
  return apiFetch<AdminKpis>("/admin/kpis");
}

export function fetchAdminTables() {
  return apiFetch<Table[]>("/admin/tables");
}

export function fetchAdminFinanceiro(): Promise<{
  kpis: AdminKpis;
  series: FinanceiroDay[];
}> {
  return apiFetch("/admin/financeiro");
}

export function fetchAdminOrders(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<Order[]>(`/admin/orders${qs}`);
}
