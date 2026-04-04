"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/contexts/toast-context";
import { Spinner } from "@/components/ui/spinner";
import { auth, db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Salva o perfil do cliente com role 'client'
      await setDoc(doc(db, "users", res.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: "client",
        createdAt: new Date().toISOString(),
      });

      toast("Conta criada com sucesso! Bem-vindo ao Pedeform.", "success");
      router.push("/");
    } catch (err: any) {
      toast("Erro ao criar conta: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Criar Conta</h1>
          <p className="text-sm text-zinc-500 mt-1">Junte-se ao Pedeform para uma experiência exclusiva.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nome Completo</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 ring-zinc-500 text-zinc-900 dark:text-zinc-50"
              placeholder="Seu nome"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 ring-zinc-500 text-zinc-900 dark:text-zinc-50"
              placeholder="exemplo@email.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 ring-zinc-500 text-zinc-900 dark:text-zinc-50"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading && <Spinner size="sm" />}
            Criar Minha Conta
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-zinc-500">Já tem uma conta?</p>
          <Button variant="ghost" onClick={() => router.push("/login")} className="w-full mt-1 text-sm underline-offset-4 hover:underline">
            Fazer login
          </Button>
        </div>
      </Card>
    </div>
  );
}
