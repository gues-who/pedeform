import type { Metadata } from "next";
import { ContaView } from "./conta-view";

export const metadata: Metadata = {
  title: "Conta",
};

export default function ContaPage() {
  return <ContaView />;
}
