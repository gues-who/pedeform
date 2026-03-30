import Link from "next/link";
import { WelcomeHero } from "@/components/WelcomeHero";
import { admin, mesaRoot } from "@/lib/routes";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-10 px-8 py-16">
        <WelcomeHero />
        <nav className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={mesaRoot("demo")}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Experiência do cliente (mesa demo)
          </Link>
          <Link
            href={admin.root}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Painel admin
          </Link>
        </nav>
        <p className="text-center text-xs text-zinc-500">
          QR code na prática: use uma URL com{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
            /mesa/&lt;id&gt;
          </code>{" "}
          estável por sessão.
        </p>
      </main>
    </div>
  );
}
