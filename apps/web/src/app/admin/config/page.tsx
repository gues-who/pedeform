"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/contexts/toast-context";
import { seedFirebase } from "@/lib/seed-firebase";
import { Spinner } from "@/components/ui/spinner";

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSeed() {
    if (!confirm("Isso irá sobrescrever dados existentes (categorias, itens do menu, mesas). Deseja continuar?")) return;
    setLoading(true);
    try {
      await seedFirebase();
      toast("Firebase populado com sucesso!", "success");
    } catch (error: any) {
      console.error(error);
      toast("Erro ao popular Firebase: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configuração do Sistema</h1>
        <p className="text-zinc-500 mt-2">Gerencie a transição do Mock para o Firebase.</p>
      </header>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Popular Banco de Dados</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Como o banco está vazio, você pode carregar os dados iniciais do mock para o Firestore.
        </p>
        <Button 
          onClick={handleSeed} 
          disabled={loading}
          variant="secondary"
          className="w-full h-12 gap-2"
        >
          {loading && <Spinner size="sm" />}
          Popular com Dados Mock
        </Button>
      </Card>

      <Card className="p-6 space-y-4 bg-zinc-50 dark:bg-zinc-900 border-dashed border-2">
        <h2 className="text-xl font-semibold">Status de Integração</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            VBA Refatorado (`api-client.ts`)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Firebase Inicializado
          </li>
          <li className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            Autenticação Cozinha (Pendente)
          </li>
        </ul>
      </Card>
    </div>
  );
}
