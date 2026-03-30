import type { Metadata } from "next";
import { PedidosView } from "./pedidos-view";

export const metadata: Metadata = {
  title: "Pedidos de mesa",
};

export default function AdminPedidosPage() {
  return <PedidosView />;
}
