import type { Metadata } from "next";
import { OperacaoView } from "./operacao-view";

export const metadata: Metadata = {
  title: "Operação",
};

export default function AdminOperacaoPage() {
  return <OperacaoView />;
}
