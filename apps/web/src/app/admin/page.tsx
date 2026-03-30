"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminKpis } from "@pedeform/shared";
import { fetchAdminKpis } from "@/lib/api-client";
import { mockKpis } from "@/data/mock-admin";
import { formatBRL } from "@/data/mock-menu";
import { admin } from "@/lib/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function AdminHomePage() {
  const [kpis, setKpis] = useState<AdminKpis | null>(null);

  useEffect(() => {
    fetchAdminKpis()
      .then((data) => { setKpis(data); })
      .catch(() => { setKpis(mockKpis); });
  }, []);

  if (!kpis) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      </div>
    );
  }

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
        <Badge tone="success">Mock ativo</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardTitle>Salão</CardTitle>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {kpis.mesasOcupadas}
            <span className="text-lg text-zinc-400">/{kpis.mesasTotal}</span>
          </p>
          <p className="text-sm text-zinc-500">mesas ocupadas</p>
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
          <p className="text-sm text-zinc-500">em cozinha / salão</p>
          <Link
            href={admin.kds}
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
          >
            Ver KDS →
          </Link>
        </Card>

        <Card>
          <CardTitle>Faturamento (hoje)</CardTitle>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatBRL(kpis.faturamentoHojeCents)}
          </p>
          <p className="text-sm text-zinc-500">
            ticket médio {formatBRL(kpis.ticketMedioCents)}
          </p>
          <Link
            href={admin.financeiro}
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
          >
            Detalhes →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Permanência média</CardTitle>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {kpis.permanenciaMediaMin} min
          </p>
        </Card>
        <Card>
          <CardTitle>Ticket médio</CardTitle>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatBRL(kpis.ticketMedioCents)}
          </p>
          <Link
            href={admin.produtos}
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
          >
            Gerenciar produtos →
          </Link>
        </Card>
      </div>
    </div>
  );
}
