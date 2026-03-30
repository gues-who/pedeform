import type { Metadata } from "next";
import Link from "next/link";
import type { AdminKpis, Table } from "@pedeform/shared";
import { mockKpis, mockMesas } from "@/data/mock-admin";
import { formatBRL } from "@/data/mock-menu";
import { admin } from "@/lib/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Visão geral",
};

async function loadOverview(): Promise<{
  kpis: AdminKpis;
  tables: Table[];
  isLive: boolean;
}> {
  try {
    const base = process.env.API_BASE_URL ?? "http://localhost:3001/v1";
    const res = await fetch(`${base}/admin/overview`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("API indisponível");
    const data = await res.json() as { kpis: AdminKpis; tables: Table[] };
    return { ...data, isLive: true };
  } catch {
    return { kpis: mockKpis, tables: mockMesas, isLive: false };
  }
}

export default async function AdminHomePage() {
  const { kpis, isLive } = await loadOverview();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Resumo operacional e financeiro.
          </p>
        </div>
        <Badge tone={isLive ? "success" : "warning"}>
          {isLive ? "API ao vivo" : "Mock"}
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardTitle>Salão</CardTitle>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {kpis.mesasOcupadas}/{kpis.mesasTotal}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            mesas ocupadas
          </p>
          <Link
            href={admin.operacao}
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
          >
            Ver operação →
          </Link>
        </Card>
        <Card>
          <CardTitle>Pedidos ativos</CardTitle>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {kpis.pedidosAtivos}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            em cozinha / salão
          </p>
        </Card>
        <Card>
          <CardTitle>Faturamento (hoje)</CardTitle>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatBRL(kpis.faturamentoHojeCents)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ticket médio {formatBRL(kpis.ticketMedioCents)}
          </p>
          <Link
            href={admin.financeiro}
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
          >
            Detalhes financeiros →
          </Link>
        </Card>
      </div>

      <Card>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Permanência média
            </dt>
            <dd className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {kpis.permanenciaMediaMin} min
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Ticket médio
            </dt>
            <dd className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatBRL(kpis.ticketMedioCents)}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
