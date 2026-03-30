/** Construtores de rotas — manter centralizado para alinhar links da aplicação. */

export function mesaRoot(mesaId: string) {
  return `/mesa/${encodeURIComponent(mesaId)}`;
}

export function mesaMenu(mesaId: string) {
  return `${mesaRoot(mesaId)}/menu`;
}

export function mesaPedido(mesaId: string) {
  return `${mesaRoot(mesaId)}/pedido`;
}

export function mesaConta(mesaId: string) {
  return `${mesaRoot(mesaId)}/conta`;
}

export function mesaAcompanhar(mesaId: string) {
  return `${mesaRoot(mesaId)}/acompanhar`;
}

export function clienteRoot() {
  return mesaRoot("demo");
}

export const reservas = {
  root: "/reserva",
} as const;

export const admin = {
  root: "/admin",
  operacao: "/admin/operacao",
  pedidos: "/admin/pedidos",
  kds: "/admin/kds",
  financeiro: "/admin/financeiro",
  produtos: "/admin/produtos",
} as const;
