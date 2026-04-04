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

// Utility to convert Firestore Timestamp to ISO string
const toIso = (ts: any) => (ts instanceof Timestamp ? ts.toDate().toISOString() : ts);

// ─── Menu ────────────────────────────────────────────────────────────────────

export async function fetchMenuCategories(): Promise<SharedMenuCategory[]> {
  const snap = await getDocs(collection(db, "categorias"));
  if (snap.empty) {
    // If empty, return a default set for now or handle as needed
    return [];
  }
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SharedMenuCategory);
}

export async function fetchMenuItems(category?: string): Promise<SharedMenuItem[]> {
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
  const docRef = doc(db, "cardapio", id);
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(docRef, cleanInput);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as SharedMenuItem;
}

export async function deleteMenuItem(id: string) {
  await deleteDoc(doc(db, "cardapio", id));
  return { ok: true as const, deletedId: id };
}

export async function uploadMenuItemPhoto(id: string, payload: { fileName: string; dataUrl: string }) {
  // Ideally use Firebase Storage, but for now we follow the mock's dataUrl pattern
  const docRef = doc(db, "cardapio", id);
  await updateDoc(docRef, { imageUrl: payload.dataUrl });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as SharedMenuItem;
}

// ─── Mesas ───────────────────────────────────────────────────────────────────

export async function fetchTables(): Promise<Table[]> {
  const snap = await getDocs(collection(db, "mesas"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Table);
}

export async function fetchTable(id: string): Promise<Table> {
  const snap = await getDoc(doc(db, "mesas", id));
  if (!snap.exists()) throw new Error("Mesa não encontrada.");
  return { id: snap.id, ...snap.data() } as Table;
}

export async function fetchTableReservations(): Promise<TableReservation[]> {
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
  const q = query(
    collection(db, "pedidos"),
    where("mesaId", "==", mesaId),
    where("status", "!=", "paid")
  );
  const snap = await getDocs(q);
  const now = serverTimestamp();
  
  let totalSubtotal = 0;
  const updates = snap.docs.map(async (d) => {
    const data = d.data() as Order;
    totalSubtotal += data.subtotalCents;
    await updateDoc(doc(db, "pedidos", d.id), { status: "paid", updatedAt: now });
  });
  await Promise.all(updates);

  // Libera a mesa
  await updateDoc(doc(db, "mesas", mesaId), { status: "livre", convidados: 0, tempoMinutos: null });

  return { 
    mesaId, 
    ok: true, 
    totalPaidCents: Math.round(totalSubtotal * 1.1) // Subtotal + 10% serviço
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
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
