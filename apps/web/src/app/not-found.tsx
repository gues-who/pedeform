"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  // No GitHub Pages, rotas arbitrárias (como mesas que não pre-renderizamos) 
  // caem aqui. Podemos tentar forçar um redirecionamento ou mostrar um link claro.
  useEffect(() => {
    // Caso o usuário queira um comportamento de SPA puro:
    // router.push('/'); 
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black text-center p-6">
      <h1 className="text-4xl font-bold tracking-tight text-white mb-2">404</h1>
      <p className="text-zinc-500 mb-8 max-w-xs">Essa mesa ou página não foi encontrada ou não foi pré-renderizada para o GitHub Pages.</p>
      <Link
        href="/"
        className="rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}
