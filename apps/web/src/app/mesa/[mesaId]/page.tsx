import { mesaMenu } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function MesaIndexPage({
  params,
}: {
  params: Promise<{ mesaId: string }>;
}) {
  const { mesaId } = await params;
  redirect(mesaMenu(mesaId));
}
