/**
 * Cardápio — fonte única em @pedeform/shared (MOCK_MENU_*).
 */
import type { SharedMenuItem } from "@pedeform/shared";

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

export function resolveMenuItemImageUrl(item: Pick<SharedMenuItem, "id" | "imageUrl">) {
  return item.imageUrl ?? MENU_ITEM_IMAGE_BY_ID[item.id];
}

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
