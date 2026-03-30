import type { Metadata } from "next";
import { ContaView } from "./conta-view";

export const metadata: Metadata = {
  title: "Conta",
};

export default async function ContaPage({
  params,
}: {
  params: Promise<{ mesaId: string }>;
}) {
  const { mesaId } = await params;
  return <ContaView mesaId={mesaId} />;
}
