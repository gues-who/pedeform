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

/**
 * Base da API REST.
 * - `NEXT_PUBLIC_API_URL` definido → usa (produção / URL pública).
 * - Browser em `localhost` / `127.0.0.1` sem env → `/api` (proxy Next → Nest,
 *   evita CORS e "Failed to fetch" entre portas).
 * - Demais casos (ex.: GitHub Pages) → fallback (geralmente falha sem API pública).
 */
function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "/api";
    }
    return "http://127.0.0.1:3001/v1";
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
