"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { mesaMenu } from "@/lib/routes";

/**
 * Redireciona /mesa/[mesaId] → /mesa/[mesaId]/menu.
 * Usa client-side router.replace para compatibilidade com static export.
 */
export default function MesaIndexPage() {
  const router = useRouter();
  const params = useParams<{ mesaId: string }>();

  useEffect(() => {
    if (params?.mesaId) {
      router.replace(mesaMenu(params.mesaId));
    }
  }, [router, params]);

  return null;
}
