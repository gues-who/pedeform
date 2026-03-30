import type { Metadata } from "next";
import { AcompanharView } from "./acompanhar-view";

export const metadata: Metadata = {
  title: "Acompanhar",
};

export default async function AcompanharPage({
  params,
}: {
  params: Promise<{ mesaId: string }>;
}) {
  const { mesaId } = await params;
  return <AcompanharView mesaId={mesaId} />;
}
