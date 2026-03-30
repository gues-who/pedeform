/**
 * Mock canônico — cardápio, mesas e pedidos seed.
 * Usado pela API (MockDataStore) e pelo front (fallback offline / GitHub Pages).
 */
import type {
  AdminKpis,
  FinanceiroDay,
  Order,
  SharedMenuCategory,
  SharedMenuItem,
  Table,
} from "./domain";

/** Categorias do cardápio */
export const MOCK_MENU_CATEGORIES: SharedMenuCategory[] = [
  { id: "entradas", label: "Entradas" },
  { id: "principais", label: "Principais" },
  { id: "sobremesas", label: "Sobremesas" },
  { id: "harmonizacoes", label: "Harmonizações" },
];

/** Pratos — catálogo completo para demos */
export const MOCK_MENU_ITEMS: SharedMenuItem[] = [
  // Entradas
  {
    id: "e1",
    category: "entradas",
    name: "Carpaccio de wagyu",
    description: "Azeite de trufa negra, rúcula e lascas de parmesão.",
    priceCents: 8900,
    sommelierNote: "Pinot Noir leve — notas terrosas equilibram a gordura.",
    imageGradient: "from-amber-900/40 to-stone-900",
  },
  {
    id: "e2",
    category: "entradas",
    name: "Ostra gratinada",
    description: "Manteiga cítrica e ervas finas.",
    priceCents: 6200,
    sommelierNote: "Champagne brut — acidez limpa com o mar.",
    imageGradient: "from-teal-900/50 to-zinc-900",
  },
  {
    id: "e3",
    category: "entradas",
    name: "Tartar de atum",
    description: "Abacate, gergelim torrado e gengibre marinado.",
    priceCents: 7400,
    sommelierNote: "Sake ginjo — umami e frescor em sintonia.",
    imageGradient: "from-rose-900/40 to-zinc-900",
  },
  {
    id: "e4",
    category: "entradas",
    name: "Burrata com tomates confit",
    description: "Manjericão fresco, pesto de pistache e azeite extra virgem.",
    priceCents: 6800,
    sommelierNote: "Verdicchio — acidez e cremosidade.",
    imageGradient: "from-orange-950/40 to-stone-900",
  },
  // Principais
  {
    id: "p1",
    category: "principais",
    name: "Filé ao molho bordelaise",
    description: "Batata confit e legumes glaceados.",
    priceCents: 18900,
    sommelierNote: "Bordeaux de corpo médio realça o molho de vinho tinto.",
    imageGradient: "from-red-950/60 to-neutral-950",
  },
  {
    id: "p2",
    category: "principais",
    name: "Peixe do dia",
    description: "Ervas do quintal e limão siciliano.",
    priceCents: 14200,
    sommelierNote: "Branco mineral da costa — textura e salinidade.",
    imageGradient: "from-sky-900/40 to-zinc-950",
  },
  {
    id: "p3",
    category: "principais",
    name: "Risoto de trufa negra",
    description: "Parmesão envelhecido 36 meses e lâminas de trufa.",
    priceCents: 16500,
    sommelierNote: "Barolo jovem — taninos firmes com a terra do fungo.",
    imageGradient: "from-yellow-950/50 to-zinc-950",
  },
  {
    id: "p4",
    category: "principais",
    name: "Cordeiro com jus de hortelã",
    description: "Purê de batata-doce e mini cenouras glaceadas.",
    priceCents: 17800,
    sommelierNote: "Syrah — especiarias e carne de caça.",
    imageGradient: "from-emerald-950/50 to-zinc-950",
  },
  // Sobremesas
  {
    id: "s1",
    category: "sobremesas",
    name: "Soufflé de chocolate",
    description: "Ganache 70% e sorvete de baunilha de Madagascar.",
    priceCents: 4800,
    sommelierNote: "Porto tawny — doçura e cacau em harmonia.",
    imageGradient: "from-amber-950/50 to-stone-950",
  },
  {
    id: "s2",
    category: "sobremesas",
    name: "Crème brûlée de lavanda",
    description: "Caramelo crocante e flor de lavanda provençal.",
    priceCents: 3900,
    sommelierNote: "Sauternes — mel e floral prolongados.",
    imageGradient: "from-purple-950/40 to-zinc-950",
  },
  {
    id: "s3",
    category: "sobremesas",
    name: "Cheesecake de frutas vermelhas",
    description: "Base de biscoito amanteigado e calda de framboesa.",
    priceCents: 4200,
    imageGradient: "from-fuchsia-950/40 to-zinc-950",
  },
  // Harmonizações
  {
    id: "h1",
    category: "harmonizacoes",
    name: "Seleção do sommelier (taça)",
    description: "Rótulo sazonal escolhido para acompanhar seu prato principal.",
    priceCents: 4500,
    imageGradient: "from-violet-950/50 to-zinc-950",
  },
  {
    id: "h2",
    category: "harmonizacoes",
    name: "Espumante de boas-vindas",
    description: "Brut rosé da Serra Gaúcha servido na chegada.",
    priceCents: 3200,
    sommelierNote: "Perfeito antes de qualquer entrada.",
    imageGradient: "from-pink-950/40 to-zinc-950",
  },
  {
    id: "h3",
    category: "harmonizacoes",
    name: "Decanter — vinho tinto premium",
    description: "Garrafa 750ml — rótulo da adega parceira.",
    priceCents: 28000,
    imageGradient: "from-red-950/50 to-zinc-950",
  },
];

/** Mesas do salão */
export const MOCK_TABLES: Table[] = [
  { id: "1", nome: "Mesa 1", convidados: 2, status: "em_atendimento", tempoMinutos: 42 },
  { id: "2", nome: "Mesa 2", convidados: 4, status: "conta", tempoMinutos: 78 },
  { id: "3", nome: "Mesa 3", convidados: 2, status: "alerta", tempoMinutos: 105 },
  { id: "4", nome: "Mesa 4", convidados: 6, status: "em_atendimento", tempoMinutos: 28 },
  { id: "5", nome: "Mesa 5", convidados: 0, status: "livre", tempoMinutos: null },
  { id: "6", nome: "Mesa 6", convidados: 3, status: "em_atendimento", tempoMinutos: 15 },
  { id: "7", nome: "Mesa 7", convidados: 0, status: "livre", tempoMinutos: null },
  { id: "8", nome: "Mesa 8", convidados: 0, status: "livre", tempoMinutos: null },
  { id: "9", nome: "Mesa 9", convidados: 2, status: "em_atendimento", tempoMinutos: 52 },
  { id: "10", nome: "Mesa 10", convidados: 0, status: "livre", tempoMinutos: null },
  { id: "vip", nome: "Mesa VIP", convidados: 2, status: "em_atendimento", tempoMinutos: 55 },
  { id: "demo", nome: "Mesa Demo", convidados: 2, status: "em_atendimento", tempoMinutos: 0 },
];

/** Timestamps ISO relativos (últimas horas) para seed de pedidos */
function isoMinutesAgo(min: number) {
  return new Date(Date.now() - min * 60_000).toISOString();
}

/**
 * Pedidos seed — cobre todos os status de OrderStatus:
 * pending, preparing, almost_ready, served, paid
 * + pedidos extras para KDS e relatórios.
 */
export const MOCK_SEED_ORDERS: Order[] = [
  // 1 — pending (recém chegou à cozinha)
  {
    id: "order_0001",
    mesaId: "1",
    status: "pending",
    items: [
      { menuItemId: "e1", name: "Carpaccio de wagyu", unitPriceCents: 8900, quantity: 1 },
      { menuItemId: "e2", name: "Ostra gratinada", unitPriceCents: 6200, quantity: 2 },
    ],
    subtotalCents: 8900 + 6200 * 2,
    createdAt: isoMinutesAgo(8),
    updatedAt: isoMinutesAgo(8),
  },
  // 2 — preparing
  {
    id: "order_0002",
    mesaId: "2",
    status: "preparing",
    items: [
      { menuItemId: "p1", name: "Filé ao molho bordelaise", unitPriceCents: 18900, quantity: 2 },
      { menuItemId: "p2", name: "Peixe do dia", unitPriceCents: 14200, quantity: 1 },
    ],
    subtotalCents: 18900 * 2 + 14200,
    createdAt: isoMinutesAgo(35),
    updatedAt: isoMinutesAgo(12),
  },
  // 3 — almost_ready
  {
    id: "order_0003",
    mesaId: "4",
    status: "almost_ready",
    items: [
      { menuItemId: "p3", name: "Risoto de trufa negra", unitPriceCents: 16500, quantity: 3 },
      { menuItemId: "h1", name: "Seleção do sommelier (taça)", unitPriceCents: 4500, quantity: 3 },
    ],
    subtotalCents: 16500 * 3 + 4500 * 3,
    createdAt: isoMinutesAgo(48),
    updatedAt: isoMinutesAgo(3),
  },
  // 4 — served (aguardando pagamento / conta)
  {
    id: "order_0004",
    mesaId: "vip",
    status: "served",
    items: [
      { menuItemId: "e3", name: "Tartar de atum", unitPriceCents: 7400, quantity: 1 },
      { menuItemId: "p4", name: "Cordeiro com jus de hortelã", unitPriceCents: 17800, quantity: 2 },
      { menuItemId: "s1", name: "Soufflé de chocolate", unitPriceCents: 4800, quantity: 2 },
    ],
    subtotalCents: 7400 + 17800 * 2 + 4800 * 2,
    createdAt: isoMinutesAgo(72),
    updatedAt: isoMinutesAgo(5),
  },
  // 5 — paid (encerrado)
  {
    id: "order_0005",
    mesaId: "9",
    status: "paid",
    items: [
      { menuItemId: "e4", name: "Burrata com tomates confit", unitPriceCents: 6800, quantity: 1 },
      { menuItemId: "p2", name: "Peixe do dia", unitPriceCents: 14200, quantity: 2 },
      { menuItemId: "s2", name: "Crème brûlée de lavanda", unitPriceCents: 3900, quantity: 1 },
      { menuItemId: "h2", name: "Espumante de boas-vindas", unitPriceCents: 3200, quantity: 1 },
    ],
    subtotalCents: 6800 + 14200 * 2 + 3900 + 3200,
    createdAt: isoMinutesAgo(180),
    updatedAt: isoMinutesAgo(120),
  },
  // 6 — pending (outra mesa)
  {
    id: "order_0006",
    mesaId: "6",
    status: "pending",
    items: [
      { menuItemId: "e1", name: "Carpaccio de wagyu", unitPriceCents: 8900, quantity: 1 },
    ],
    subtotalCents: 8900,
    createdAt: isoMinutesAgo(4),
    updatedAt: isoMinutesAgo(4),
  },
  // 7 — preparing (demo)
  {
    id: "order_0007",
    mesaId: "demo",
    status: "preparing",
    items: [
      { menuItemId: "p1", name: "Filé ao molho bordelaise", unitPriceCents: 18900, quantity: 1 },
      { menuItemId: "s3", name: "Cheesecake de frutas vermelhas", unitPriceCents: 4200, quantity: 1 },
    ],
    subtotalCents: 18900 + 4200,
    createdAt: isoMinutesAgo(22),
    updatedAt: isoMinutesAgo(6),
  },
  // 8 — almost_ready
  {
    id: "order_0008",
    mesaId: "3",
    status: "almost_ready",
    items: [
      { menuItemId: "p2", name: "Peixe do dia", unitPriceCents: 14200, quantity: 2 },
    ],
    subtotalCents: 14200 * 2,
    createdAt: isoMinutesAgo(40),
    updatedAt: isoMinutesAgo(2),
  },
  // 9 — served
  {
    id: "order_0009",
    mesaId: "2",
    status: "served",
    items: [
      { menuItemId: "h3", name: "Decanter — vinho tinto premium", unitPriceCents: 28000, quantity: 1 },
      { menuItemId: "s1", name: "Soufflé de chocolate", unitPriceCents: 4800, quantity: 4 },
    ],
    subtotalCents: 28000 + 4800 * 4,
    createdAt: isoMinutesAgo(95),
    updatedAt: isoMinutesAgo(10),
  },
  // 10 — paid (segundo encerrado — faturamento)
  {
    id: "order_0010",
    mesaId: "4",
    status: "paid",
    items: [
      { menuItemId: "e2", name: "Ostra gratinada", unitPriceCents: 6200, quantity: 6 },
      { menuItemId: "p3", name: "Risoto de trufa negra", unitPriceCents: 16500, quantity: 6 },
    ],
    subtotalCents: 6200 * 6 + 16500 * 6,
    createdAt: isoMinutesAgo(240),
    updatedAt: isoMinutesAgo(200),
  },
];

/** Próximo número sequencial após o seed (order_0011, …) */
export const MOCK_NEXT_ORDER_SEQUENCE = MOCK_SEED_ORDERS.length + 1;

/** KPIs estáticos alinhados ao seed (fallback quando API indisponível) */
export const MOCK_KPIS_FALLBACK: AdminKpis = {
  mesasOcupadas: MOCK_TABLES.filter((t) => t.status !== "livre").length,
  mesasTotal: MOCK_TABLES.length,
  pedidosAtivos: MOCK_SEED_ORDERS.filter(
    (o) => o.status !== "paid" && o.status !== "served",
  ).length,
  ticketMedioCents: 21500,
  faturamentoHojeCents:
    MOCK_SEED_ORDERS.filter((o) => o.status === "paid").reduce((s, o) => s + o.subtotalCents, 0) ||
    428900,
  permanenciaMediaMin: 58,
};

/** Série semanal de exemplo (fallback) */
export const MOCK_FINANCEIRO_SERIES: FinanceiroDay[] = [
  { label: "Seg", faturamentoCents: 312000 },
  { label: "Ter", faturamentoCents: 289000 },
  { label: "Qua", faturamentoCents: 356000 },
  { label: "Qui", faturamentoCents: 401000 },
  { label: "Sex", faturamentoCents: 498000 },
  { label: "Sáb", faturamentoCents: 612000 },
  { label: "Dom", faturamentoCents: MOCK_KPIS_FALLBACK.faturamentoHojeCents },
];
