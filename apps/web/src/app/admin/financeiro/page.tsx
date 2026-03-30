import type { Metadata } from "next";
import type { AdminKpis, FinanceiroDay } from "@pedeform/shared";
import { mockFinanceiroSeries, mockKpis } from "@/data/mock-admin";
import { formatBRL } from "@/data/mock-menu";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Financeiro",
};

async function loadFinanceiro(): Promise<{
  kpis: AdminKpis;
  series: FinanceiroDay[];
  isLive: boolean;
}> {
  try {
    const base = process.env.API_BASE_URL ?? "http://localhost:3001/v1";
    const res = await fetch(`${base}/admin/financeiro`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("API indisponível");
    const data = await res.json() as { kpis: AdminKpis; series: FinanceiroDay[] };
    return { ...data, isLive: true };
  } catch {
    return { kpis: mockKpis, series: mockFinanceiroSeries, isLive: false };
  }
}

export default async function AdminFinanceiroPage() {
  const { kpis, series, isLive } = await loadFinanceiro();
  const max = Math.max(...series.map((d) => d.faturamentoCents));

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
        <Badge tone={isLive ? "success" : "warning"}>
          {isLive ? "API ao vivo" : "Mock"}
        </Badge>
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
