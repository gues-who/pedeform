/**
 * Cardápio — fonte única em @pedeform/shared (MOCK_MENU_*).
 */
export {
  MOCK_MENU_CATEGORIES as MENU_CATEGORIES,
  MOCK_MENU_ITEMS as MENU_ITEMS,
  type MenuCategoryId,
  type SharedMenuItem as MenuItem,
} from "@pedeform/shared";

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
