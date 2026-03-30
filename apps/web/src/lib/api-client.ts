import type {
  AdminKpis,
  FinanceiroDay,
  MenuCategoryId,
  Order,
  OrderItem,
  OrderStatus,
  SharedMenuCategory,
  SharedMenuItem,
  TableReservation,
  Table,
} from "@pedeform/shared";

/**
 * Base da API REST.
 * - `NEXT_PUBLIC_API_URL` definido → usa (produção / URL pública).
 * - Browser sem env → prioriza `/api` (proxy Next → Nest), evitando CORS e
 *   "Failed to fetch" entre portas e hosts.
 * - Em GitHub Pages (sem servidor Next), mantém fallback local para forçar
 *   o aviso de configuração de URL pública.
 */
function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h.endsWith("github.io")) return "http://127.0.0.1:3001/v1";
    return "/api";
  }

  return (
    process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3001/v1"
  );
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch (e) {
    const onLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    const hint = onLocal
      ? " Confirme que a API está em http://127.0.0.1:3001 (ex.: npm run dev na raiz do monorepo)."
      : " Defina NEXT_PUBLIC_API_URL com a URL pública da API.";
    throw new Error(
      e instanceof Error && e.message === "Failed to fetch"
        ? `Não foi possível conectar à API.${hint}`
        : e instanceof Error
          ? e.message
          : "Erro de rede",
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
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

export interface UpsertMenuItemInput {
  id?: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  priceCents: number;
  sommelierNote?: string;
  imageGradient?: string;
  imageUrl?: string;
}

export function createMenuItem(input: UpsertMenuItemInput) {
  return apiFetch<SharedMenuItem>("/menu/items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMenuItem(id: string, input: Partial<UpsertMenuItemInput>) {
  return apiFetch<SharedMenuItem>(`/menu/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteMenuItem(id: string) {
  return apiFetch<{ ok: true; deletedId: string }>(`/menu/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function uploadMenuItemPhoto(id: string, payload: { fileName: string; dataUrl: string }) {
  return apiFetch<SharedMenuItem>(`/menu/items/${encodeURIComponent(id)}/photo`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Mesas ───────────────────────────────────────────────────────────────────

export function fetchTables() {
  return apiFetch<Table[]>("/tables");
}

export function fetchTable(id: string) {
  return apiFetch<Table>(`/tables/${encodeURIComponent(id)}`);
}

export function fetchTableReservations() {
  return apiFetch<TableReservation[]>("/tables/reservations");
}

export function reserveTable(
  tableId: string,
  payload: { guestName: string; guests: number; reservedFor: string; notes?: string },
) {
  return apiFetch<TableReservation>(`/tables/${encodeURIComponent(tableId)}/reserve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
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

/** Fecha a conta: todos os pedidos em aberto da mesa → pagos. */
export function closeMesaBill(mesaId: string) {
  return apiFetch<{
    mesaId: string;
    orders: Order[];
    totalPaidCents: number;
  }>(`/mesas/${encodeURIComponent(mesaId)}/pay`, {
    method: "POST",
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
