/** Dados de demonstração para painéis admin — substituir por API. */

export const mockKpis = {
  mesasOcupadas: 12,
  mesasTotal: 18,
  pedidosAtivos: 23,
  ticketMedioCents: 18750,
  faturamentoHojeCents: 428900,
  permanenciaMediaMin: 94,
};

export type MesaOperacao = {
  id: string;
  nome: string;
  convidados: number;
  status: "livre" | "em_atendimento" | "conta" | "alerta";
  tempoMinutos: number | null;
};

export const mockMesas: MesaOperacao[] = [
  {
    id: "1",
    nome: "Mesa 1",
    convidados: 2,
    status: "em_atendimento",
    tempoMinutos: 42,
  },
  {
    id: "2",
    nome: "Mesa 2",
    convidados: 4,
    status: "conta",
    tempoMinutos: 78,
  },
  {
    id: "3",
    nome: "Mesa 3",
    convidados: 2,
    status: "alerta",
    tempoMinutos: 105,
  },
  {
    id: "4",
    nome: "Mesa 4",
    convidados: 6,
    status: "em_atendimento",
    tempoMinutos: 28,
  },
  {
    id: "5",
    nome: "Mesa 5",
    convidados: 0,
    status: "livre",
    tempoMinutos: null,
  },
];

export const mockFinanceiroSeries = [
  { label: "Seg", faturamentoCents: 312000 },
  { label: "Ter", faturamentoCents: 289000 },
  { label: "Qua", faturamentoCents: 356000 },
  { label: "Qui", faturamentoCents: 401000 },
  { label: "Sex", faturamentoCents: 498000 },
  { label: "Sáb", faturamentoCents: 612000 },
  { label: "Dom", faturamentoCents: 428900 },
];
