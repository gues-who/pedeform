"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Spinner } from "@/components/ui/spinner";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function RootLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Se já estiver logado, redireciona para a home/welcome
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "kitchen") router.push("/cozinha");
      else router.push("/welcome");
    }
  }, [user, authLoading, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Bem-vindo de volta!", "success");
      // O useEffect acima cuidará do redirecionamento
    } catch (err: any) {
      toast("Credenciais inválidas ou erro: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-1"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block p-3 rounded-2xl bg-zinc-900 border border-white/10 mb-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Pedeform Access</h1>
            <p className="text-zinc-400 text-sm">Entre na sua conta para continuar.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-blue-500/50 transition-all text-white placeholder:text-zinc-600"
                placeholder="nome@exemplo.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-blue-500/50 transition-all text-white placeholder:text-zinc-600"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {loading ? <Spinner size="sm" /> : "Entrar agora →"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-transparent px-2 text-zinc-500">ou</span></div>
          </div>

          <div className="space-y-3">
            <Button variant="ghost" onClick={() => router.push("/register")} className="w-full h-11 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-medium">
              Não tem uma conta? <span className="text-blue-400 ml-1 underline decoration-blue-500/30">Cadastre-se</span>
            </Button>
            
            <p className="text-center text-[10px] text-zinc-600 px-4">
              Acesso exclusivo para clientes registrados, staff de cozinha e administradores.
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[9px] text-amber-500/90 text-center leading-relaxed font-sans uppercase tracking-tighter">
                Firebase não configurado: defina <code className="text-amber-400/90">NEXT_PUBLIC_FIREBASE_*</code> em{" "}
                <code className="text-amber-400/90">apps/web/.env.local</code> (ou na raiz do monorepo) e reinicie o servidor.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
