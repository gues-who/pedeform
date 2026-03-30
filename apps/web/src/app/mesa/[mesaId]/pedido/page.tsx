import type { Metadata } from "next";
import { PedidoView } from "./pedido-view";

export const metadata: Metadata = {
  title: "Pedido",
};

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ mesaId: string }>;
}) {
  const { mesaId } = await params;
  return <PedidoView mesaId={mesaId} />;
}
