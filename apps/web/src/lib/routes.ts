/** Construtores de rotas — manter centralizado para alinhar links e futura API. */

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

export const admin = {
  root: "/admin",
  operacao: "/admin/operacao",
  kds: "/admin/kds",
  financeiro: "/admin/financeiro",
} as const;
