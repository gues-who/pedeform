import { MesaShell } from "./mesa-shell";

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
