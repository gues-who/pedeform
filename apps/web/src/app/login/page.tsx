"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Spinner } from "@/components/ui/spinner";
import { auth, db } from "@/lib/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Bem-vindo!", "success");
      
      // Wait for user to be loaded or fetch it manually (safer in a login handler)
      const u = auth.currentUser;
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : "client";
        
        switch (role) {
          case "admin": router.push("/admin"); break;
          case "kitchen": router.push("/cozinha"); break;
          default: router.push("/"); break;
        }
      }
    } catch (err: any) {
      toast("Erro ao entrar: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function createKitchenUser() {
    setLoading(true);
    try {
      const email = "cozinha@pedeform.com";
      const pass = "123456";
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        role: "kitchen",
      });
      toast("Usuário da cozinha criado! Email: cozinha@pedeform.com / Senha: 123456", "success");
    } catch (err: any) {
      toast("Já existe ou erro: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function createAdminUser() {
    setLoading(true);
    try {
      const email = "admin@pedeform.com";
      const pass = "123456";
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        role: "admin",
      });
      toast("Usuário administrador criado! Email: admin@pedeform.com / Senha: 123456", "success");
    } catch (err: any) {
      toast("Já existe ou erro: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Pedeform Access</h1>
          <p className="text-sm text-zinc-500 mt-1">Conecte-se à sua experiência fluida.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 ring-zinc-500 text-zinc-900 dark:text-zinc-50"
              placeholder="exemplo@pedeform.com"
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
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading && <Spinner size="sm" />}
            Entrar
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-500">Novo por aqui?</p>
          <Button variant="secondary" onClick={() => router.push("/register")} className="w-full h-11">
            Criar conta de cliente
          </Button>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
          <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest font-bold">Desenvolvedor: Criar contas demo</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={createAdminUser} disabled={loading} className="text-[10px] h-8 border border-zinc-200 dark:border-zinc-800">
              Criar Admin
            </Button>
            <Button variant="ghost" onClick={createKitchenUser} disabled={loading} className="text-[10px] h-8 border border-zinc-200 dark:border-zinc-800">
              Criar Cozinha
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
