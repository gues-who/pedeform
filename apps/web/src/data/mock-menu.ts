export type MenuCategoryId = "entradas" | "principais" | "sobremesas" | "harmonizacoes";

export type MenuItem = {
  id: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  priceCents: number;
  /** Sugestão sommelier (harmonização) — opcional */
  sommelierNote?: string;
  imageGradient: string;
};

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string }[] = [
  { id: "entradas", label: "Entradas" },
  { id: "principais", label: "Principais" },
  { id: "sobremesas", label: "Sobremesas" },
  { id: "harmonizacoes", label: "Harmonizações" },
];

export const MENU_ITEMS: MenuItem[] = [
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
    id: "s1",
    category: "sobremesas",
    name: "Soufflé de chocolate",
    description: "Ganache 70% e sorvete de baunilha de Madagascar.",
    priceCents: 4800,
    sommelierNote: "Porto tawny — doçura e cacau em harmonia.",
    imageGradient: "from-amber-950/50 to-stone-950",
  },
  {
    id: "h1",
    category: "harmonizacoes",
    name: "Seleção do sommelier (taça)",
    description: "Rótulo sazonal escolhido para acompanhar seu prato principal.",
    priceCents: 4500,
    imageGradient: "from-violet-950/50 to-zinc-950",
  },
];

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
