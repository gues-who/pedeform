import type { Metadata } from "next";
import { MenuView } from "./menu-view";

export const metadata: Metadata = {
  title: "Cardápio",
};

export default function MenuPage() {
  return <MenuView />;
}
