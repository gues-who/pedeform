import { MesaShell } from "./mesa-shell";

/** Mesas pré-geradas no build estático (GitHub Pages). */
export function generateStaticParams() {
  return [
    { mesaId: "demo" },
    { mesaId: "1" },
    { mesaId: "2" },
    { mesaId: "3" },
    { mesaId: "4" },
    { mesaId: "vip" },
  ];
}

export default async function MesaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ mesaId: string }>;
}) {
  const { mesaId } = await params;
  return <MesaShell mesaId={mesaId}>{children}</MesaShell>;
}
