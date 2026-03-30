"use client";

import { MesaBottomNav } from "@/components/mesa/mesa-bottom-nav";
import { MesaHeader } from "@/components/mesa/mesa-header";
import { MesaCartProvider } from "@/contexts/mesa-cart-context";
import { MesaOrdersProvider } from "@/contexts/mesa-orders-context";
import type { ReactNode } from "react";

export function MesaShell({
  mesaId,
  children,
}: {
  mesaId: string;
  children: ReactNode;
}) {
  return (
    <MesaCartProvider mesaId={mesaId}>
      <MesaOrdersProvider mesaId={mesaId}>
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
          <MesaHeader mesaId={mesaId} />
          <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
            {children}
          </div>
          <MesaBottomNav mesaId={mesaId} />
        </div>
      </MesaOrdersProvider>
    </MesaCartProvider>
  );
}
