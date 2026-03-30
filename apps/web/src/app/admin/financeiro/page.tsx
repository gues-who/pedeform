"use client";

import { useEffect, useState } from "react";
import { formatBRL } from "@/data/mock-menu";
import { fetchAdminFinanceiro } from "@/lib/api-client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function AdminFinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    mesasOcupadas: 0,
    mesasTotal: 0,
    pedidosAtivos: 0,
    ticketMedioCents: 0,
    faturamentoHojeCents: 0,
    permanenciaMediaMin: 0,
  });
  const [series, setSeries] = useState<{ label: string; faturamentoCents: number }[]>([]);

  useEffect(() => {
    fetchAdminFinanceiro()
      .then((data) => {
        setKpis(data.kpis);
        setSeries(data.series);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  const max = Math.max(1, ...series.map((d) => d.faturamentoCents));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Financeiro
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Faturamento e ticket — fonte de verdade futura em PostgreSQL.
          </p>
        </div>
        <Badge tone="success">Mock ativo</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Hoje</CardTitle>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatBRL(kpis.faturamentoHojeCents)}
          </p>
        </Card>
        <Card>
          <CardTitle>Ticket médio</CardTitle>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatBRL(kpis.ticketMedioCents)}
          </p>
        </Card>
        <Card>
          <CardTitle>Permanência</CardTitle>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {kpis.permanenciaMediaMin} min
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Faturamento (7 dias)</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Barras proporcionais ao maior valor da semana.
        </p>
        <div className="mt-6 flex h-48 items-end justify-between gap-2">
          {series.map((d) => {
            const h = max > 0 ? (d.faturamentoCents / max) * 100 : 0;
            return (
              <div
                key={d.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full max-w-[3rem] rounded-t-md bg-zinc-900 dark:bg-zinc-100"
                  style={{ height: `${Math.max(h, 4)}%` }}
                  title={formatBRL(d.faturamentoCents)}
                />
                <span className="text-[10px] font-medium text-zinc-500">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Stripe</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Conciliação de pagamentos, chargebacks e métodos (Apple Pay / Google
          Pay) aparecerão aqui após integração com webhooks e relatórios.
        </p>
      </Card>
    </div>
  );
}
