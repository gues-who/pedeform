import type { Metadata } from "next";
import type { Table, TableStatus } from "@pedeform/shared";
import { mockMesas } from "@/data/mock-admin";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Operação",
};

async function loadTables(): Promise<{ tables: Table[]; isLive: boolean }> {
  try {
    const base = process.env.API_BASE_URL ?? "http://localhost:3001/v1";
    const res = await fetch(`${base}/admin/tables`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("API indisponível");
    return { tables: await res.json() as Table[], isLive: true };
  } catch {
    return { tables: mockMesas, isLive: false };
  }
}

function statusTone(s: TableStatus): "neutral" | "success" | "warning" | "danger" {
  switch (s) {
    case "livre": return "neutral";
    case "em_atendimento": return "success";
    case "conta": return "warning";
    case "alerta": return "danger";
    default: return "neutral";
  }
}

function statusLabel(s: TableStatus) {
  switch (s) {
    case "livre": return "Livre";
    case "em_atendimento": return "Em atendimento";
    case "conta": return "Conta";
    case "alerta": return "Alerta";
    default: return s;
  }
}

export default async function AdminOperacaoPage() {
  const { tables, isLive } = await loadTables();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Operação
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Ritmo do salão e mesas em tempo real.
          </p>
        </div>
        <Badge tone={isLive ? "success" : "warning"}>
          {isLive ? "API ao vivo" : "Mock"}
        </Badge>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {tables.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {m.nome}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {m.convidados > 0
                    ? `${m.convidados} convidados`
                    : "Sem ocupação"}
                </p>
              </div>
              <Badge tone={statusTone(m.status)}>{statusLabel(m.status)}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
              <span className="text-zinc-500">Tempo na mesa</span>
              <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
                {m.tempoMinutos !== null ? `${m.tempoMinutos} min` : "—"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Próximos passos</CardTitle>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Assinar sala WebSocket <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">admin</code> para atualizações em tempo real</li>
          <li>Eventos: mudança de estado da mesa, pedido pronto, alerta de tempo</li>
          <li>Mapa do salão com posição das mesas</li>
        </ul>
      </Card>
    </div>
  );
}
