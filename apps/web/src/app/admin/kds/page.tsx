import type { Metadata } from "next";
import { KdsView } from "./kds-view";

export const metadata: Metadata = {
  title: "KDS — Cozinha",
};

export default function KdsPage() {
  return <KdsView />;
}
