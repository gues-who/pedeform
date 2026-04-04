import type { Metadata } from "next";
import { MenuView } from "./menu-view";

export const metadata: Metadata = {
  title: "Cardápio",
};

export function generateStaticParams() {
  return [{ mesaId: "demo" }, { mesaId: "1" }, { mesaId: "2" }, { mesaId: "vip" }];
}

export default function MenuPage() {
  return <MenuView />;
}
