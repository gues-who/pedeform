import Link from "next/link";
import { admin } from "@/lib/routes";

export function MesaHeader({
  mesaId,
  label,
}: {
  mesaId: string;
  label?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">
            Sessão
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {label ?? `Mesa ${mesaId}`}
          </p>
        </div>
        <Link
          href={admin.root}
          className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
