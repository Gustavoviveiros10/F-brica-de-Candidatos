// Tipos e formatação do painel admin da Fábrica. Os dados vêm das funções admin_* do banco.

export type ResumoAdmin = {
  empresas: { total: number; ativas: number; teste: number; novas_mes: number };
  liberacoes_30d: number;
  liberacoes_30d_antes: number;
  creditos_vendidos_mes: number;
  saldo_total: number;
  receita_mes: number;
  pagamentos_mes: number;
  candidatos_ativos: number;
  dias: { dia: string; total: number }[];
};

type ItemAtencao = { id: string; nome: string; saldo: number; ultima_atividade: string };
export type Atencao = Partial<Record<"teste_acabou" | "pouco_credito" | "parada" | "sem_liberar", { total: number; lista: ItemAtencao[] }>>;

export type Evento = {
  tipo: "liberacao" | "credito" | "cadastro" | "busca_vazia";
  em: string;
  empresa_id: string;
  empresa: string;
  delta: number | null;
  motivo: string | null;
  justificativa: string | null;
  candidato: string | null;
  funcao: string | null;
  cidade: string | null;
  busca: string | null;
};

export type EmpresaLinha = {
  id: string;
  nome: string;
  cnpj: string;
  status: string;
  saldo: number;
  criado_em: string;
  cidade: string | null;
  uf: string | null;
  plano: string | null;
  plano_creditos: number | null;
  lib_total: number;
  lib_30d: number;
  ultima_atividade: string;
  total: number;
};

export type FichaEmpresa = Omit<EmpresaLinha, "total"> & {
  plano_id: string | null;
  whatsapp: string | null;
  ultima_liberacao: string | null;
  usuarios: { nome: string; papel: string; email: string | null; ultimo_acesso: string | null }[];
  movimentos: { id: number; delta: number; motivo: string; justificativa: string | null; criado_em: string }[];
  liberacoes: { id: string; etapa: string; criado_em: string; candidato: string | null; funcao: string | null; cidade: string | null }[];
  funil: Record<string, number>;
  buscas: { descricao: string; total: number; criado_em: string }[];
};

export const STATUS: Record<string, { nome: string; classe: string }> = {
  teste: { nome: "Teste", classe: "chip-brand" },
  ativa: { nome: "Ativa", classe: "chip-ok" },
  inadimplente: { nome: "Inadimplente", classe: "chip-warn" },
  bloqueada: { nome: "Bloqueada", classe: "chip-bad" },
};

export const MOTIVOS: Record<string, string> = {
  teste_gratis: "Contatos grátis do teste",
  ciclo: "Créditos do plano",
  liberacao: "Contato liberado",
  ajuste_admin: "Ajuste da equipe",
  expiracao: "Créditos expirados",
};

export const PAPEIS: Record<string, string> = { admin: "Administrador", recrutador: "Recrutador" };

const TZ = "America/Sao_Paulo";
const diaSP = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const diasAtras = (iso: string) => {
  const hoje = new Date(diaSP(new Date()) + "T00:00:00Z").getTime();
  const dia = new Date(diaSP(new Date(iso)) + "T00:00:00Z").getTime();
  return Math.round((hoje - dia) / 86400000);
};

export const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
export const diaMes = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });

// "Hoje", "Ontem" ou "13/10": cabeçalho dos grupos da linha do tempo.
export function rotuloDia(iso: string) {
  const d = diasAtras(iso);
  return d === 0 ? "Hoje" : d === 1 ? "Ontem" : diaMes(iso);
}

// "hoje, 10:42", "ontem, 17:30", "há 6 dias" ou "01/08".
export function quando(iso: string | null | undefined) {
  if (!iso) return "nunca";
  const d = diasAtras(iso);
  if (d === 0) return `hoje, ${hora(iso)}`;
  if (d === 1) return `ontem, ${hora(iso)}`;
  if (d < 30) return `há ${d} dias`;
  return diaMes(iso);
}

export const desde = (iso: string) => diasAtras(iso);

export const cnpj = (v: string) => v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export const n = (v: number) => Number(v).toLocaleString("pt-BR");

// Monta a URL mantendo os filtros atuais e trocando só o que mudou.
export function comParametros(base: string, atuais: Record<string, string | undefined>, mudar: Record<string, string | null>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...atuais, ...mudar })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

// ---------- Financeiro (admin_financeiro / admin_clientes) ----------

export type Financeiro = {
  receita_mes: number;
  pagamentos_mes: number;
  receita_mes_antes: number;
  meses: { mes: string; total: number }[];
  recorrente: number;
  clientes: number;
  atrasadas: number;
  cancelados: number;
  empresas: number;
  em_teste: number;
  ja_pagaram: number;
  por_plano: { id: string; nome: string; preco: number; destaque: boolean; clientes: number; recorrente: number }[];
  renovacoes: { empresa_id: string; empresa: string; plano: string; preco: number; proxima: string; situacao: string }[];
};

export type ClienteLinha = {
  empresa_id: string;
  empresa: string;
  cidade: string | null;
  plano: string;
  preco_centavos: number;
  desde: string | null;
  proxima: string | null;
  situacao: "em_dia" | "atrasada" | "cancelada";
  total_pago: number;
  total: number;
};

export const SITUACAO: Record<string, { nome: string; classe: string }> = {
  em_dia: { nome: "Em dia", classe: "chip-ok" },
  atrasada: { nome: "Renovação atrasada", classe: "chip-warn" },
  cancelada: { nome: "Cancelado", classe: "" },
};

export const METODOS: Record<string, string> = { pix: "Pix", boleto: "Boleto", cartao: "Cartão" };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
// "2026-10" → "out" (curto) ou "outubro".
export const nomeMes = (aaaamm: string, longo = false) => (longo ? MESES_LONGOS : MESES)[Number(aaaamm.slice(5, 7)) - 1] ?? aaaamm;

// ---------- Candidatos (admin_candidatos / admin_candidato) ----------

export type CandidatoAdmin = {
  id: string;
  nome: string | null;
  whatsapp: string | null;
  email: string | null;
  funcao: string | null;
  categoria: string;
  cidade: string | null;
  uf: string | null;
  temperatura: string;
  criado_em: string;
  confirmado_em: string | null;
  tem_cv: boolean;
  ativo: boolean;
  liberacoes: number;
  total: number;
};

export type ResumoCandidatos = {
  contagem: { todos: number; ativos: number; ocultos: number; novos: number; novos_antes: number; com_cv: number; quentes: number };
  funcoes: { id: number; nome: string; n: number }[];
  cidades: { id: number; nome: string; uf: string; n: number }[];
};

export type FichaCandidatoAdmin = {
  id: string;
  nome: string | null;
  whatsapp: string | null;
  email: string | null;
  bairro: string | null;
  cv_path: string | null;
  consentimento_em: string | null;
  consentimento_versao: string | null;
  funcao: string | null;
  categoria: string;
  cidade: string | null;
  uf: string | null;
  temperatura: string;
  ativo: boolean;
  origem: string | null;
  criado_em: string;
  disponibilidade: string;
  disponibilidade_confirmada_em: string | null;
  experiencia_anos: number | null;
  escolaridade: string | null;
  formacao_curso: string | null;
  formacao_status: string | null;
  turno: string | null;
  turnos: string[] | null;
  contratos: string[] | null;
  pretensao_salarial: number | null;
  situacao: string | null;
  cnh: string | null;
  pcd: string | null;
  habilidades: string[] | null;
  cursos: string[] | null;
  respostas: { pergunta: string; resposta: string | null }[];
  captacao: { novo: boolean; pagina: string | null; funcao_informada: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; criado_em: string }[];
  liberacoes: { empresa_id: string; empresa: string; etapa: string; criado_em: string }[];
};
