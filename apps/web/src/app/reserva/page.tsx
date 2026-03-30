"use client";

import { useEffect, useMemo, useState } from "react";
import type { Table } from "@pedeform/shared";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { fetchTables, reserveTable } from "@/lib/api-client";
import { clienteRoot, mesaRoot } from "@/lib/routes";

function toDatetimeLocalValue(date: Date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export default function ReservaPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tableId, setTableId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guests, setGuests] = useState("2");
  const [reservedFor, setReservedFor] = useState(
    toDatetimeLocalValue(new Date(Date.now() + 90 * 60000)),
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchTables()
      .then((data) => {
        setTables(data);
        const free = data.find((table) => table.status === "livre");
        if (free) setTableId(free.id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Falha ao carregar mesas."))
      .finally(() => setLoading(false));
  }, []);

  const availableTables = useMemo(
    () => tables.filter((table) => table.status === "livre" || table.status === "reservada"),
    [tables],
  );

  const onReserve = async () => {
    setMessage(null);
    setError(null);
    if (!tableId) {
      setError("Selecione uma mesa.");
      return;
    }
    const guestsNumber = Number(guests);
    if (!Number.isFinite(guestsNumber) || guestsNumber < 1) {
      setError("Número de convidados inválido.");
      return;
    }
    if (!guestName.trim()) {
      setError("Informe o nome do responsável.");
      return;
    }

    setSaving(true);
    try {
      const reservation = await reserveTable(tableId, {
        guestName,
        guests: Math.round(guestsNumber),
        reservedFor: new Date(reservedFor).toISOString(),
        notes: notes || undefined,
      });
      setMessage(
        `Reserva confirmada para mesa ${reservation.tableId} em ${new Date(
          reservation.reservedFor,
        ).toLocaleString("pt-BR")}.`,
      );
      const data = await fetchTables();
      setTables(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível concluir a reserva.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Pedeform</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Reserva de mesa
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Escolha a mesa e confirme sua reserva em poucos passos.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando mesas...</p>
        ) : (
          <div className="space-y-3">
            <Select label="Mesa" value={tableId} onChange={(e) => setTableId(e.target.value)}>
              <option value="" disabled>
                Selecione
              </option>
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.nome} {table.status === "reservada" ? "(já reservada)" : ""}
                </option>
              ))}
            </Select>
            <Input
              label="Responsável"
              placeholder="Seu nome"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            <Input
              label="Convidados"
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
            <Input
              label="Data e hora"
              type="datetime-local"
              value={reservedFor}
              onChange={(e) => setReservedFor(e.target.value)}
            />
            <Input
              label="Observações (opcional)"
              placeholder="Alergias, preferências, ocasião..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button className="w-full" onClick={onReserve} disabled={saving}>
              {saving ? "Confirmando..." : "Confirmar reserva"}
            </Button>
          </div>
        )}
      </div>

      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-red-300/70 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="underline-offset-4 hover:underline" href={clienteRoot()}>
          Ir para modo cliente
        </Link>
        <Link className="underline-offset-4 hover:underline" href={mesaRoot("demo")}>
          Abrir mesa demo
        </Link>
      </div>
    </div>
  );
}
