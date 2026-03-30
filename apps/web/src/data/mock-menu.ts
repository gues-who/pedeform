/**
 * Cardápio — fonte única em @pedeform/shared (MOCK_MENU_*).
 */
import type { MenuCategoryId, SharedMenuItem } from "@pedeform/shared";

export {
  MOCK_MENU_CATEGORIES as MENU_CATEGORIES,
  MOCK_MENU_ITEMS as MENU_ITEMS,
  type MenuCategoryId,
  type SharedMenuItem as MenuItem,
} from "@pedeform/shared";

const MENU_ITEM_IMAGE_BY_ID: Record<string, string> = {
  e1: "/menu/entradas/e1-carpaccio.jpeg",
  e2: "/menu/entradas/e2-ostra.jpeg",
  e3: "/menu/entradas/e3-tartar.jpeg",
  e4: "/menu/entradas/e4-burrata.jpeg",
  p1: "/menu/principais/p1-file.jpeg",
  p2: "/menu/principais/p2-peixe.jpeg",
  p3: "/menu/principais/p3-risoto.jpeg",
  p4: "/menu/principais/p4-cordeiro.jpeg",
  s1: "/menu/sobremesas/s1-souffle.jpeg",
  s2: "/menu/sobremesas/s2-creme-brulee.avif",
  s3: "/menu/sobremesas/s3-cheesecake.jpeg",
};

const MENU_ITEM_IMAGE_BY_KEYWORDS: Array<{ keywords: string[]; imageUrl: string }> = [
  { keywords: ["carpaccio", "wagyu"], imageUrl: "/menu/entradas/e1-carpaccio.jpeg" },
  { keywords: ["ostra"], imageUrl: "/menu/entradas/e2-ostra.jpeg" },
  { keywords: ["tartar", "atum"], imageUrl: "/menu/entradas/e3-tartar.jpeg" },
  { keywords: ["burrata", "tomate"], imageUrl: "/menu/entradas/e4-burrata.jpeg" },
  { keywords: ["file", "filé", "bordelaise"], imageUrl: "/menu/principais/p1-file.jpeg" },
  { keywords: ["peixe"], imageUrl: "/menu/principais/p2-peixe.jpeg" },
  { keywords: ["risoto", "trufa"], imageUrl: "/menu/principais/p3-risoto.jpeg" },
  { keywords: ["cordeiro", "lamb"], imageUrl: "/menu/principais/p4-cordeiro.jpeg" },
  { keywords: ["souffle", "sufle", "chocolate"], imageUrl: "/menu/sobremesas/s1-souffle.jpeg" },
  { keywords: ["creme", "brulee", "brulée"], imageUrl: "/menu/sobremesas/s2-creme-brulee.avif" },
  { keywords: ["cheesecake"], imageUrl: "/menu/sobremesas/s3-cheesecake.jpeg" },
];

const CATEGORY_FALLBACKS: Record<MenuCategoryId, string[]> = {
  entradas: [
    "/menu/entradas/e1-carpaccio.jpeg",
    "/menu/entradas/e2-ostra.jpeg",
    "/menu/entradas/e3-tartar.jpeg",
    "/menu/entradas/e4-burrata.jpeg",
  ],
  principais: [
    "/menu/principais/p1-file.jpeg",
    "/menu/principais/p2-peixe.jpeg",
    "/menu/principais/p3-risoto.jpeg",
    "/menu/principais/p4-cordeiro.jpeg",
  ],
  sobremesas: [
    "/menu/sobremesas/s1-souffle.jpeg",
    "/menu/sobremesas/s2-creme-brulee.avif",
    "/menu/sobremesas/s3-cheesecake.jpeg",
  ],
  harmonizacoes: ["/menu/principais/p1-file.jpeg"],
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function pickCategoryFallback(category: MenuCategoryId, seed: string) {
  const options = CATEGORY_FALLBACKS[category];
  if (!options.length) return undefined;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i)) % 10_000;
  return options[hash % options.length];
}

export function resolveMenuItemImageUrl(
  item: Pick<SharedMenuItem, "id" | "name" | "category" | "imageUrl">,
) {
  if (item.imageUrl) return item.imageUrl;

  const byId = MENU_ITEM_IMAGE_BY_ID[item.id];
  if (byId) return byId;

  const normalizedName = normalizeText(item.name);
  const byKeywords = MENU_ITEM_IMAGE_BY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(normalizeText(keyword))),
  )?.imageUrl;
  if (byKeywords) return byKeywords;

  return pickCategoryFallback(item.category, `${item.id}:${normalizedName}`);
}

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
