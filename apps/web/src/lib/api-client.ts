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
import {
  MOCK_FINANCEIRO_SERIES,
  MOCK_MENU_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_SEED_ORDERS,
  MOCK_TABLES,
} from "@pedeform/shared";

type LocalDb = {
  menuItems: SharedMenuItem[];
  tables: Table[];
  reservations: TableReservation[];
  orders: Order[];
};

const DB_KEY = "pedeform.mock.db.v1";

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function createSeedDb(): LocalDb {
  return {
    menuItems: clone(MOCK_MENU_ITEMS),
    tables: clone(MOCK_TABLES),
    reservations: [],
    orders: clone(MOCK_SEED_ORDERS),
  };
}

let memoryDb: LocalDb = createSeedDb();

function readDb(): LocalDb {
  if (typeof window === "undefined") return memoryDb;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      window.localStorage.setItem(DB_KEY, JSON.stringify(memoryDb));
      return memoryDb;
    }
    const parsed = JSON.parse(raw) as LocalDb;
    if (!parsed?.menuItems || !parsed?.tables || !parsed?.orders || !parsed?.reservations) {
      window.localStorage.setItem(DB_KEY, JSON.stringify(memoryDb));
      return memoryDb;
    }
    memoryDb = parsed;
    return parsed;
  } catch {
    return memoryDb;
  }
}

function writeDb(next: LocalDb) {
  memoryDb = next;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(next));
}

async function simulate<T>(value: T): Promise<T> {
  return Promise.resolve(clone(value));
}

function nextOrderId(orders: Order[]) {
  const max = orders.reduce((acc, order) => {
    const match = order.id.match(/order_(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `order_${String(max + 1).padStart(4, "0")}`;
}

function nextReservationId(reservations: TableReservation[]) {
  const max = reservations.reduce((acc, reservation) => {
    const match = reservation.id.match(/reservation_(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `reservation_${String(max + 1).padStart(4, "0")}`;
}

function slugifyName(name: string) {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `item-${Date.now()}`;
}

function getKpis(db: LocalDb): AdminKpis {
  const occupied = db.tables.filter((t) => t.status !== "livre");
  const activeOrders = db.orders.filter(
    (o) => o.status !== "paid" && o.status !== "served",
  );
  const paidOrders = db.orders.filter((o) => o.status === "paid");
  const faturamento = paidOrders.reduce((s, o) => s + o.subtotalCents, 0);
  const ticketMedio =
    paidOrders.length > 0 ? Math.round(faturamento / paidOrders.length) : 21500;
  const permanencias = occupied
    .map((t) => t.tempoMinutos ?? 0)
    .filter((m) => m > 0);
  const permanenciaMedia =
    permanencias.length > 0
      ? Math.round(permanencias.reduce((a, b) => a + b, 0) / permanencias.length)
      : 58;

  return {
    mesasOcupadas: occupied.length,
    mesasTotal: db.tables.length,
    pedidosAtivos: activeOrders.length,
    ticketMedioCents: ticketMedio,
    faturamentoHojeCents: faturamento > 0 ? faturamento : 428900,
    permanenciaMediaMin: permanenciaMedia,
  };
}

function getFinanceiroSeries(db: LocalDb): FinanceiroDay[] {
  const dom = getKpis(db).faturamentoHojeCents;
  return MOCK_FINANCEIRO_SERIES.map((day) =>
    day.label === "Dom" ? { ...day, faturamentoCents: dom } : day,
  );
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export function fetchMenuCategories() {
  return simulate<SharedMenuCategory[]>(MOCK_MENU_CATEGORIES);
}

export function fetchMenuItems(category?: string) {
  const db = readDb();
  const data = category
    ? db.menuItems.filter((item) => item.category === category)
    : db.menuItems;
  return simulate<SharedMenuItem[]>(data);
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
  const db = readDb();
  const baseId = input.id?.trim() || slugifyName(input.name);
  const exists = new Set(db.menuItems.map((item) => item.id));
  let id = baseId;
  let suffix = 1;
  while (exists.has(id)) {
    id = `${baseId}-${suffix++}`;
  }
  const created: SharedMenuItem = {
    id,
    category: input.category,
    name: input.name.trim(),
    description: input.description.trim(),
    priceCents: input.priceCents,
    sommelierNote: input.sommelierNote?.trim() || undefined,
    imageGradient: input.imageGradient || "from-zinc-900/40 to-zinc-950",
    imageUrl: input.imageUrl,
  };
  writeDb({ ...db, menuItems: [created, ...db.menuItems] });
  return simulate(created);
}

export function updateMenuItem(id: string, input: Partial<UpsertMenuItemInput>) {
  const db = readDb();
  const idx = db.menuItems.findIndex((item) => item.id === id);
  if (idx < 0) throw new Error("Produto não encontrado.");
  const updated: SharedMenuItem = {
    ...db.menuItems[idx],
    ...input,
    name: input.name?.trim() ?? db.menuItems[idx]!.name,
    description: input.description?.trim() ?? db.menuItems[idx]!.description,
    sommelierNote: input.sommelierNote?.trim() || undefined,
  };
  const menuItems = [...db.menuItems];
  menuItems[idx] = updated;
  writeDb({ ...db, menuItems });
  return simulate(updated);
}

export function deleteMenuItem(id: string) {
  const db = readDb();
  const menuItems = db.menuItems.filter((item) => item.id !== id);
  writeDb({ ...db, menuItems });
  return simulate({ ok: true as const, deletedId: id });
}

export function uploadMenuItemPhoto(id: string, payload: { fileName: string; dataUrl: string }) {
  const db = readDb();
  const idx = db.menuItems.findIndex((item) => item.id === id);
  if (idx < 0) throw new Error("Produto não encontrado.");
  const updated: SharedMenuItem = {
    ...db.menuItems[idx],
    imageUrl: payload.dataUrl,
  };
  const menuItems = [...db.menuItems];
  menuItems[idx] = updated;
  writeDb({ ...db, menuItems });
  return simulate(updated);
}

// ─── Mesas ───────────────────────────────────────────────────────────────────

export function fetchTables() {
  const db = readDb();
  return simulate<Table[]>(db.tables);
}

export function fetchTable(id: string) {
  const db = readDb();
  const table = db.tables.find((t) => t.id === id);
  if (!table) throw new Error("Mesa não encontrada.");
  return simulate<Table>(table);
}

export function fetchTableReservations() {
  const db = readDb();
  const reservations = [...db.reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return simulate<TableReservation[]>(reservations);
}

export function reserveTable(
  tableId: string,
  payload: { guestName: string; guests: number; reservedFor: string; notes?: string },
) {
  const db = readDb();
  const tableIdx = db.tables.findIndex((table) => table.id === tableId);
  if (tableIdx < 0) throw new Error("Mesa não encontrada.");
  const table = db.tables[tableIdx]!;
  if (table.status !== "livre" && table.status !== "reservada") {
    throw new Error("Mesa indisponível para reserva.");
  }
  const reservation: TableReservation = {
    id: nextReservationId(db.reservations),
    tableId,
    guestName: payload.guestName.trim(),
    guests: payload.guests,
    reservedFor: payload.reservedFor,
    notes: payload.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  const tables = [...db.tables];
  tables[tableIdx] = {
    ...table,
    status: "reservada",
    convidados: payload.guests,
    tempoMinutos: null,
  };
  writeDb({
    ...db,
    tables,
    reservations: [reservation, ...db.reservations],
  });
  return simulate<TableReservation>(reservation);
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export function fetchOrdersByMesa(mesaId: string) {
  const db = readDb();
  const orders = db.orders
    .filter((order) => order.mesaId === mesaId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return simulate<Order[]>(orders);
}

export function fetchOrder(orderId: string) {
  const db = readDb();
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Pedido não encontrado.");
  return simulate<Order>(order);
}

export function createOrder(mesaId: string, items: OrderItem[]) {
  const db = readDb();
  const now = new Date().toISOString();
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity,
    0,
  );
  const created: Order = {
    id: nextOrderId(db.orders),
    mesaId,
    items,
    status: "pending",
    subtotalCents,
    createdAt: now,
    updatedAt: now,
  };
  const tableIdx = db.tables.findIndex((table) => table.id === mesaId);
  const tables = [...db.tables];
  if (tableIdx >= 0) {
    const table = tables[tableIdx]!;
    if (table.status === "livre" || table.status === "reservada") {
      tables[tableIdx] = { ...table, status: "em_atendimento", tempoMinutos: 0 };
    }
  }
  writeDb({ ...db, tables, orders: [created, ...db.orders] });
  return simulate<Order>(created);
}

/** Fecha a conta: todos os pedidos em aberto da mesa → pagos. */
export function closeMesaBill(mesaId: string) {
  const db = readDb();
  const now = new Date().toISOString();
  const paidOrders: Order[] = [];
  const orders = db.orders.map((order) => {
    if (order.mesaId !== mesaId || order.status === "paid") return order;
    const updated = { ...order, status: "paid" as const, updatedAt: now };
    paidOrders.push(updated);
    return updated;
  });
  const totalPaidCents = paidOrders.reduce((sum, order) => sum + order.subtotalCents, 0);
  writeDb({ ...db, orders });
  return simulate({ mesaId, orders: paidOrders, totalPaidCents });
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const db = readDb();
  const idx = db.orders.findIndex((order) => order.id === orderId);
  if (idx < 0) throw new Error("Pedido não encontrado.");
  const updated: Order = {
    ...db.orders[idx]!,
    status,
    updatedAt: new Date().toISOString(),
  };
  const orders = [...db.orders];
  orders[idx] = updated;
  writeDb({ ...db, orders });
  return simulate(updated);
}

function filterOrdersByStatus(all: Order[], status?: string) {
  if (!status) return all;
  const statuses = status.split(",").map((s) => s.trim()) as OrderStatus[];
  return all.filter((order) => statuses.includes(order.status));
}

function sortTablesByName(tables: Table[]) {
  return [...tables].sort((a, b) => a.nome.localeCompare(b.nome));
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function fetchAdminOverview(): Promise<{
  kpis: AdminKpis;
  tables: Table[];
  financeiro: FinanceiroDay[];
}> {
  const db = readDb();
  return simulate({
    kpis: getKpis(db),
    tables: sortTablesByName(db.tables),
    financeiro: getFinanceiroSeries(db),
  });
}

export function fetchAdminKpis() {
  const db = readDb();
  return simulate<AdminKpis>(getKpis(db));
}

export function fetchAdminTables() {
  const db = readDb();
  return simulate<Table[]>(sortTablesByName(db.tables));
}

export function fetchAdminFinanceiro(): Promise<{
  kpis: AdminKpis;
  series: FinanceiroDay[];
}> {
  const db = readDb();
  return simulate({
    kpis: getKpis(db),
    series: getFinanceiroSeries(db),
  });
}

export function fetchAdminOrders(status?: string) {
  const db = readDb();
  const filtered = filterOrdersByStatus(db.orders, status).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return simulate<Order[]>(filtered);
}
