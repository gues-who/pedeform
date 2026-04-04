"use client";

import { KdsView } from "@/app/admin/kds/kds-view";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function KitchenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?callback=/cozinha");
    } else if (!loading && user && user.role !== "kitchen" && user.role !== "admin") {
      router.push("/login?error=unauthorized");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8 mt-12">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Cozinha</h1>
          <p className="text-zinc-500 mt-2">Logado como: {user.email || 'Cozinha'}</p>
        </div>
      </header>
      
      <main>
        <KdsView />
      </main>
    </div>
  );
}
