import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
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
import {
  closeLocalMesaBill,
  createLocalOrder,
  getLocalOrders,
  updateLocalOrderStatus,
} from "./local-orders";

// Utility to convert Firestore Timestamp to ISO string
const toIso = (ts: any) => (ts instanceof Timestamp ? ts.toDate().toISOString() : ts);

const OFFLINE_MENU_KEY = "pedeform.offline.menu.items";
const OFFLINE_TABLES_KEY = "pedeform.offline.tables";
const OFFLINE_RESERVATIONS_KEY = "pedeform.offline.reservas";
const OFFLINE_ORDER_STATUS_KEY = "pedeform.offline.orderStatus";

function clone<T>(x: T): T {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x)) as T;
}

function getOfflineMenuItems(): SharedMenuItem[] {
  if (typeof window === "undefined") return clone(MOCK_MENU_ITEMS);
  try {
    const raw = window.localStorage.getItem(OFFLINE_MENU_KEY);
    if (raw) return JSON.parse(raw) as SharedMenuItem[];
  } catch {
    /* ignore */
  }
  const initial = clone(MOCK_MENU_ITEMS);
  window.localStorage.setItem(OFFLINE_MENU_KEY, JSON.stringify(initial));
  return initial;
}

function saveOfflineMenuItems(items: SharedMenuItem[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OFFLINE_MENU_KEY, JSON.stringify(items));
  }
}

function getOfflineTables(): Table[] {
  if (typeof window === "undefined") return clone(MOCK_TABLES);
  try {
    const raw = window.localStorage.getItem(OFFLINE_TABLES_KEY);
    if (raw) return JSON.parse(raw) as Table[];
  } catch {
    /* ignore */
  }
  const initial = clone(MOCK_TABLES);
  window.localStorage.setItem(OFFLINE_TABLES_KEY, JSON.stringify(initial));
  return initial;
}

function saveOfflineTables(tables: Table[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OFFLINE_TABLES_KEY, JSON.stringify(tables));
  }
}

function getOfflineReservations(): TableReservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_RESERVATIONS_KEY);
    if (raw) return JSON.parse(raw) as TableReservation[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveOfflineReservations(rows: TableReservation[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OFFLINE_RESERVATIONS_KEY, JSON.stringify(rows));
  }
}

function getOfflineOrderStatusOverrides(): Record<string, OrderStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OFFLINE_ORDER_STATUS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, OrderStatus>;
  } catch {
    /* ignore */
  }
  return {};
}

function saveOfflineOrderStatusOverrides(map: Record<string, OrderStatus>) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OFFLINE_ORDER_STATUS_KEY, JSON.stringify(map));
  }
}

function applyOrderOverrides(order: Order): Order {
  const overrides = getOfflineOrderStatusOverrides();
  const s = overrides[order.id];
  return s ? { ...order, status: s, updatedAt: new Date().toISOString() } : order;
}

function mergeOrdersForMesa(mesaId: string): Order[] {
  const byId = new Map<string, Order>();
  for (const o of MOCK_SEED_ORDERS) {
    if (o.mesaId === mesaId) byId.set(o.id, applyOrderOverrides(clone(o)));
  }
  if (typeof window !== "undefined") {
    for (const o of getLocalOrders(mesaId)) {
      byId.set(o.id, applyOrderOverrides(o));
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function allOfflineOrders(): Order[] {
  const byId = new Map<string, Order>();
  for (const o of MOCK_SEED_ORDERS) {
    byId.set(o.id, applyOrderOverrides(clone(o)));
  }
  if (typeof window !== "undefined") {
    const seenMesas = new Set<string>();
    for (const o of MOCK_SEED_ORDERS) seenMesas.add(o.mesaId);
    for (const id of [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "demo", "vip",
    ]) {
      seenMesas.add(id);
    }
    for (const mesaId of seenMesas) {
      for (const o of getLocalOrders(mesaId)) {
        byId.set(o.id, applyOrderOverrides(o));
      }
    }
  }
  return [...byId.values()];
}

function updateOfflineOrderStatus(orderId: string, status: OrderStatus): Order {
  for (const mesaId of [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "demo", "vip",
  ]) {
    const updated = updateLocalOrderStatus(mesaId, orderId, status);
    if (updated) return applyOrderOverrides(updated);
  }
  const seed = MOCK_SEED_ORDERS.find((o) => o.id === orderId);
  if (seed) {
    const overrides = { ...getOfflineOrderStatusOverrides(), [orderId]: status };
    saveOfflineOrderStatusOverrides(overrides);
    return applyOrderOverrides({ ...clone(seed), status, updatedAt: new Date().toISOString() });
  }
  throw new Error("Pedido não encontrado.");
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export async function fetchMenuCategories(): Promise<SharedMenuCategory[]> {
  if (!db) return clone(MOCK_MENU_CATEGORIES);
  const snap = await getDocs(collection(db, "categorias"));
  if (snap.empty) {
    return [];
  }
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SharedMenuCategory);
}

export async function fetchMenuItems(category?: string): Promise<SharedMenuItem[]> {
  if (!db) {
    const items = getOfflineMenuItems();
    return category ? items.filter((i) => i.category === category) : items;
  }
  const colRef = collection(db, "cardapio");
  let q = query(colRef);
  if (category) {
    q = query(colRef, where("category", "==", category));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SharedMenuItem);
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

export async function createMenuItem(input: UpsertMenuItemInput): Promise<SharedMenuItem> {
  if (!db) {
    const items = getOfflineMenuItems();
    const id =
      input.id?.trim() ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      `item-${Date.now()}`;
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
    saveOfflineMenuItems([created, ...items.filter((i) => i.id !== id)]);
    return created;
  }
  const docRef = input.id ? doc(db, "cardapio", input.id) : doc(collection(db, "cardapio"));
  const data = {
    category: input.category,
    name: input.name.trim(),
    description: input.description.trim(),
    priceCents: input.priceCents,
    sommelierNote: input.sommelierNote?.trim() || null,
    imageGradient: input.imageGradient || "from-zinc-900/40 to-zinc-950",
    imageUrl: input.imageUrl || null,
  };
  await setDoc(docRef, data);
  return { id: docRef.id, ...data } as SharedMenuItem;
}

export async function updateMenuItem(id: string, input: Partial<UpsertMenuItemInput>) {
  if (!db) {
    const items = getOfflineMenuItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Produto não encontrado.");
    const updated = { ...items[idx]!, ...input } as SharedMenuItem;
    const next = [...items];
    next[idx] = updated;
    saveOfflineMenuItems(next);
    return updated;
  }
  const docRef = doc(db, "cardapio", id);
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(docRef, cleanInput);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as SharedMenuItem;
}

export async function deleteMenuItem(id: string) {
  if (!db) {
    saveOfflineMenuItems(getOfflineMenuItems().filter((i) => i.id !== id));
    return { ok: true as const, deletedId: id };
  }
  await deleteDoc(doc(db, "cardapio", id));
  return { ok: true as const, deletedId: id };
}

export async function uploadMenuItemPhoto(id: string, payload: { fileName: string; dataUrl: string }) {
  if (!db) {
    return updateMenuItem(id, { imageUrl: payload.dataUrl });
  }
  // Ideally use Firebase Storage, but for now we follow the mock's dataUrl pattern
  const docRef = doc(db, "cardapio", id);
  await updateDoc(docRef, { imageUrl: payload.dataUrl });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as SharedMenuItem;
}

// ─── Mesas ───────────────────────────────────────────────────────────────────

export async function fetchTables(): Promise<Table[]> {
  if (!db) return getOfflineTables();
  const snap = await getDocs(collection(db, "mesas"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Table);
}

export async function fetchTable(id: string): Promise<Table> {
  if (!db) {
    const t = getOfflineTables().find((x) => x.id === id);
    if (!t) throw new Error("Mesa não encontrada.");
    return t;
  }
  const snap = await getDoc(doc(db, "mesas", id));
  if (!snap.exists()) throw new Error("Mesa não encontrada.");
  return { id: snap.id, ...snap.data() } as Table;
}

export async function fetchTableReservations(): Promise<TableReservation[]> {
  if (!db) {
    return [...getOfflineReservations()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const q = query(collection(db, "reservas"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, createdAt: toIso(data.createdAt) } as TableReservation;
  });
}

export async function reserveTable(
  tableId: string,
  payload: { guestName: string; guests: number; reservedFor: string; notes?: string },
) {
  if (!db) {
    const tables = getOfflineTables();
    const idx = tables.findIndex((t) => t.id === tableId);
    if (idx < 0) throw new Error("Mesa não encontrada.");
    const table = tables[idx]!;
    if (table.status !== "livre" && table.status !== "reservada") {
      throw new Error("Mesa indisponível para reserva.");
    }
    const createdAt = new Date().toISOString();
    const reservation: TableReservation = {
      id: `reservation_${Date.now()}`,
      tableId,
      guestName: payload.guestName.trim(),
      guests: payload.guests,
      reservedFor: payload.reservedFor,
      notes: payload.notes?.trim(),
      createdAt,
    };
    const nextTables = [...tables];
    nextTables[idx] = {
      ...table,
      status: "reservada",
      convidados: payload.guests,
      tempoMinutos: null,
    };
    saveOfflineTables(nextTables);
    saveOfflineReservations([reservation, ...getOfflineReservations()]);
    return reservation;
  }
  const tableRef = doc(db, "mesas", tableId);
  const reservationRef = collection(db, "reservas");

  const reservation = {
    tableId,
    guestName: payload.guestName.trim(),
    guests: payload.guests,
    reservedFor: payload.reservedFor,
    notes: payload.notes?.trim() || null,
    createdAt: serverTimestamp(),
  };

  const res = await addDoc(reservationRef, reservation);
  await updateDoc(tableRef, {
    status: "reservada",
    convidados: payload.guests,
    tempoMinutos: null,
  });

  return { id: res.id, ...reservation, createdAt: new Date().toISOString() } as unknown as TableReservation;
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export async function fetchOrdersByMesa(mesaId: string): Promise<Order[]> {
  if (!db) return mergeOrdersForMesa(mesaId);
  const q = query(
    collection(db, "pedidos"),
    where("mesaId", "==", mesaId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    } as Order;
  });
}

export function subscribeOrdersByMesa(mesaId: string, callback: (orders: Order[]) => void) {
  if (!db) {
    callback(mergeOrdersForMesa(mesaId));
    const id = setInterval(() => callback(mergeOrdersForMesa(mesaId)), 2500);
    return () => clearInterval(id);
  }
  const q = query(
    collection(db, "pedidos"),
    where("mesaId", "==", mesaId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      } as Order;
    });
    callback(orders);
  });
}

export async function fetchOrder(orderId: string): Promise<Order> {
  if (!db) {
    const found = allOfflineOrders().find((o) => o.id === orderId);
    if (!found) throw new Error("Pedido não encontrado.");
    return found;
  }
  const snap = await getDoc(doc(db, "pedidos", orderId));
  if (!snap.exists()) throw new Error("Pedido não encontrado.");
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  } as Order;
}

export async function createOrder(mesaId: string, items: OrderItem[]): Promise<Order> {
  if (!db) {
    const created = createLocalOrder(mesaId, items);
    const tables = getOfflineTables();
    const idx = tables.findIndex((t) => t.id === mesaId);
    if (idx >= 0) {
      const t = tables[idx]!;
      if (t.status === "livre" || t.status === "reservada") {
        const next = [...tables];
        next[idx] = { ...t, status: "em_atendimento", tempoMinutos: 0 };
        saveOfflineTables(next);
      }
    }
    return created;
  }
  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const now = serverTimestamp();
  
  const orderData = {
    mesaId,
    items,
    status: "pending" as OrderStatus,
    subtotalCents,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, "pedidos"), orderData);
  
  // Atualiza status da mesa
  const tableRef = doc(db, "mesas", mesaId);
  const tableSnap = await getDoc(tableRef);
  if (tableSnap.exists()) {
    const tableData = tableSnap.data();
    if (tableData.status === "livre" || tableData.status === "reservada") {
      await updateDoc(tableRef, { status: "em_atendimento", tempoMinutos: 0 });
    }
  }

  return { 
    id: docRef.id, 
    ...orderData, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  } as unknown as Order;
}

export async function closeMesaBill(mesaId: string) {
  if (!db) {
    const before = mergeOrdersForMesa(mesaId);
    let totalSubtotal = 0;
    const overrides = { ...getOfflineOrderStatusOverrides() };
    for (const o of before) {
      if (o.status !== "paid") {
        totalSubtotal += o.subtotalCents;
        overrides[o.id] = "paid";
      }
    }
    saveOfflineOrderStatusOverrides(overrides);
    closeLocalMesaBill(mesaId);
    const tables = getOfflineTables();
    const idx = tables.findIndex((t) => t.id === mesaId);
    if (idx >= 0) {
      const next = [...tables];
      next[idx] = { ...tables[idx]!, status: "livre", convidados: 0, tempoMinutos: null };
      saveOfflineTables(next);
    }
    return {
      mesaId,
      ok: true as const,
      totalPaidCents: Math.round(totalSubtotal * 1.1),
    };
  }
  const firestore = db;
  const q = query(
    collection(firestore, "pedidos"),
    where("mesaId", "==", mesaId),
    where("status", "!=", "paid")
  );
  const snap = await getDocs(q);
  const now = serverTimestamp();
  
  let totalSubtotal = 0;
  const updates = snap.docs.map(async (d) => {
    const data = d.data() as Order;
    totalSubtotal += data.subtotalCents;
    await updateDoc(doc(firestore, "pedidos", d.id), { status: "paid", updatedAt: now });
  });
  await Promise.all(updates);

  // Libera a mesa
  await updateDoc(doc(firestore, "mesas", mesaId), { status: "livre", convidados: 0, tempoMinutos: null });

  return { 
    mesaId, 
    ok: true, 
    totalPaidCents: Math.round(totalSubtotal * 1.1) // Subtotal + 10% serviço
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  if (!db) {
    return updateOfflineOrderStatus(orderId, status);
  }
  const docRef = doc(db, "pedidos", orderId);
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
  const snap = await getDoc(docRef);
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: toIso(data?.createdAt),
    updatedAt: toIso(data?.updatedAt),
  } as Order;
}

// ─── Kitchen (Cozinha) ────────────────────────────────────────────────────────

/** Busca pedidos ativos para a cozinha: pendentes, preparando ou quase prontos. */
export async function fetchKitchenOrders(): Promise<Order[]> {
  if (!db) {
    return allOfflineOrders()
      .filter((o) => ["pending", "preparing", "almost_ready"].includes(o.status))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  const q = query(
    collection(db, "pedidos"),
    where("status", "in", ["pending", "preparing", "almost_ready"]),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    } as Order;
  });
}

export function subscribeKitchenOrders(callback: (orders: Order[]) => void) {
  if (!db) {
    const pick = () =>
      allOfflineOrders()
        .filter((o) =>
          ["pending", "preparing", "almost_ready", "served"].includes(o.status),
        )
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    callback(pick());
    const id = setInterval(() => callback(pick()), 3000);
    return () => clearInterval(id);
  }
  const q = query(
    collection(db, "pedidos"),
    where("status", "in", ["pending", "preparing", "almost_ready", "served"]),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      } as Order;
    });
    callback(orders);
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function fetchAdminOverview(): Promise<{
  kpis: AdminKpis;
  tables: Table[];
  financeiro: FinanceiroDay[];
}> {
  const tables = await fetchTables();
  if (!db) {
    const orders = allOfflineOrders();
    const occupied = tables.filter((t) => t.status !== "livre");
    const activeOrders = orders.filter(
      (o) => o.status !== "paid" && o.status !== "served",
    );
    const paidOrders = orders.filter((o) => o.status === "paid");
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
    const kpis: AdminKpis = {
      mesasOcupadas: occupied.length,
      mesasTotal: tables.length,
      pedidosAtivos: activeOrders.length,
      ticketMedioCents: ticketMedio,
      faturamentoHojeCents: faturamento > 0 ? faturamento : 428900,
      permanenciaMediaMin: permanenciaMedia,
    };
    const dom = kpis.faturamentoHojeCents;
    const financeiro = MOCK_FINANCEIRO_SERIES.map((d) =>
      d.label === "Dom" ? { ...d, faturamentoCents: dom } : d,
    );
    return {
      kpis,
      tables: [...tables].sort((a, b) => a.nome.localeCompare(b.nome)),
      financeiro,
    };
  }
  const ordersSnap = await getDocs(collection(db, "pedidos"));
  const orders = ordersSnap.docs.map(d => d.data() as Order);

  const occupied = tables.filter((t) => t.status !== "livre");
  const activeOrders = orders.filter((o) => o.status !== "paid" && o.status !== "served");
  const paidOrders = orders.filter((o) => o.status === "paid");
  const faturamento = paidOrders.reduce((s, o) => s + o.subtotalCents, 0);
  const ticketMedio = paidOrders.length > 0 ? Math.round(faturamento / paidOrders.length) : 0;
  
  const kpis: AdminKpis = {
    mesasOcupadas: occupied.length,
    mesasTotal: tables.length,
    pedidosAtivos: activeOrders.length,
    ticketMedioCents: ticketMedio,
    faturamentoHojeCents: faturamento,
    permanenciaMediaMin: 0, // Simplified for now
  };

  return {
    kpis,
    tables: tables.sort((a, b) => a.id.localeCompare(b.id)),
    financeiro: [], // Simplified for now
  };
}

export async function fetchAdminKpis() {
  const overview = await fetchAdminOverview();
  return overview.kpis;
}

export async function fetchAdminFinanceiro(): Promise<{
  kpis: AdminKpis;
  series: { label: string; faturamentoCents: number }[];
}> {
  const overview = await fetchAdminOverview();
  return {
    kpis: overview.kpis,
    series: [
      { label: "Seg", faturamentoCents: 0 },
      { label: "Ter", faturamentoCents: 0 },
      { label: "Qua", faturamentoCents: 0 },
      { label: "Qui", faturamentoCents: 0 },
      { label: "Sex", faturamentoCents: 0 },
      { label: "Sáb", faturamentoCents: 0 },
      { label: "Dom", faturamentoCents: overview.kpis.faturamentoHojeCents },
    ],
  };
}

export async function fetchAdminTables() {
  return fetchTables();
}

export async function fetchAdminOrders(status?: string) {
  if (!db) {
    let list = allOfflineOrders().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (status) {
      const statuses = status.split(",").map((s) => s.trim()) as OrderStatus[];
      list = list.filter((o) => statuses.includes(o.status));
    }
    return list;
  }
  const colRef = collection(db, "pedidos");
  let q = query(colRef, orderBy("createdAt", "desc"));
  if (status) {
    const statuses = status.split(",").map((s) => s.trim()) as OrderStatus[];
    q = query(colRef, where("status", "in", statuses), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    } as Order;
  });
}
