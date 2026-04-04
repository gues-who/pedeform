"use client";

import Link from "next/link";
import { admin, mesaRoot, reservas } from "@/lib/routes";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const DEMO_MESAS = ["1", "2", "demo", "vip"];

export default function WelcomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Navbar Minimalista */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-xl font-bold tracking-tighter">Pedeform</div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-zinc-500 hidden sm:inline-block">Olá, <span className="text-zinc-900 dark:text-zinc-100 font-medium">{user.email}</span></span>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-[10px] uppercase font-bold tracking-widest">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                Login
              </Link>
              <Link href="/register" className="text-xs font-semibold px-4 py-2 bg-zinc-900 text-white rounded-full dark:bg-zinc-100 dark:text-zinc-900">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
          Concierge digital
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Pedeform
        </h1>
        <p className="mt-4 max-w-sm text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          Experiência fluida para alta gastronomia — cardápio, salão e cozinha
          em sincronia.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={mesaRoot("demo")}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Experiência do cliente →
          </Link>

          {(user?.role === "kitchen" || user?.role === "admin") && (
            <Link
              href="/cozinha"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Painel Cozinha
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin/config"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Configurar Firebase
            </Link>
          )}

          <Link
            href={reservas.root}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Reservar mesa
          </Link>
        </div>
      </main>

      {/* Módulos */}
      <section className="border-t border-zinc-200/80 bg-white px-6 py-14 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Módulos disponíveis
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Cardápio & Pedido",
                desc: "Cliente escaneia QR, navega pelo menu imersivo e envia à cozinha com um toque.",
                href: mesaRoot("demo"),
                cta: "Abrir mesa demo",
              },
              {
                title: "Maître & Operação",
                desc: "Visão em tempo real de todas as mesas, status e alertas via WebSocket.",
                href: admin.operacao,
                cta: "Ver operação",
              },
              {
                title: "KDS — Cozinha",
                desc: "Fila de pedidos por estação; avance o status diretamente na tela.",
                href: admin.kds,
                cta: "Abrir KDS",
              },
            ].map((m) => (
              <div
                key={m.href}
                className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {m.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {m.desc}
                </p>
                <Link
                  href={m.href}
                  className="mt-4 inline-block text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                >
                  {m.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mesas de demonstração */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Mesas de demonstração
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_MESAS.map((id) => (
              <Link
                key={id}
                href={mesaRoot(id)}
                className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Mesa {id}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <footer className="border-t border-zinc-200/80 px-6 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">Pedeform — Alta gastronomia</p>
          <div className="flex flex-wrap gap-2">
            {["Next.js 16", "Firebase", "NestJS", "Tailwind", "Framer Motion"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-zinc-200 px-3 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-800"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
