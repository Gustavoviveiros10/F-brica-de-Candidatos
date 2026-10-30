// Filtros da busca das empresas. Espelham o formulário de cadastro (/sou-profissional):
// o bloco comum vale para todas as funções e as perguntas da vaga mudam conforme a família da função.
import type { PerguntaVaga } from "@/lib/cadastro-candidato";
import { SEGMENTOS, SITUACOES, PRETENSOES } from "@/lib/cadastro-candidato";

export type ParamsBusca = Record<string, string | string[] | undefined>;

export const um = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) || undefined;
export const varios = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);

// Enquanto a base tem poucos candidatos, a busca mostra só Função, Cidade, Raio e Experiência
// (pedido do Gustavo em 2026-10-30). Mudar para true traz de volta as perguntas da vaga e os filtros gerais.
export const FILTROS_EXTRAS = false;

// Cada pergunta da vaga vai na URL como r_<codigo>, repetido quando tem mais de uma marcada.
export const PREFIXO = "r_";

// Perguntas que valem como filtro para a função (ou para a área inteira, se todas as funções dela são da mesma família).
export function perguntasFiltro(todas: PerguntaVaga[], familia: string | null, funcaoId: number | null) {
  if (!familia) return [];
  return todas
    .filter((p) => p.familia === familia && (!p.so_funcoes || (funcaoId != null && p.so_funcoes.includes(funcaoId))))
    .sort((a, b) => a.ordem - b.ordem)
    .map((p) => ({ ...p, opcoes: p.opcoes.filter((o) => o !== p.opcao_nenhuma) }));
}

// Lê os r_* da URL: { codigo: [opções marcadas] }. O banco confere código e opção contra a tabela perguntas.
export function respostasDaUrl(f: ParamsBusca) {
  const r: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(f)) {
    if (!k.startsWith(PREFIXO) || !/^r_[a-z0-9_]{1,40}$/.test(k)) continue;
    const marcadas = varios(v).filter((o) => o.length <= 80).slice(0, 12);
    if (marcadas.length) r[k.slice(PREFIXO.length)] = marcadas;
  }
  return r;
}

// Bloco comum do formulário, com os valores que o banco grava.
export const EXPERIENCIAS_FILTRO = [
  { valor: "1", rotulo: "1 ano ou mais" },
  { valor: "3", rotulo: "3 anos ou mais" },
  { valor: "5", rotulo: "Mais de 5 anos" },
];
export const INDUSTRIA_FILTRO = [
  { valor: "sim", rotulo: "Sim (carteira ou temporário)" },
  { valor: "carteira", rotulo: "Sim, com carteira assinada" },
];
export const SEGMENTOS_FILTRO = SEGMENTOS.filter((s) => s.valor !== "Outra");
// "No mínimo": Médio completo também traz quem tem Técnico ou Superior.
export const ESCOLARIDADES_FILTRO = [
  { valor: "Ensino médio completo", rotulo: "Médio completo ou mais" },
  { valor: "Técnico", rotulo: "Técnico ou mais" },
  { valor: "Superior", rotulo: "Superior" },
];
export const SITUACOES_FILTRO = SITUACOES.map((s) => ({ valor: s.valor, rotulo: s.rotulo === "Não" ? "Não está trabalhando" : s.rotulo }));
// Categoria que a pessoa precisa ter (C também dirige B, e assim por diante).
export const CNHS_FILTRO = [
  { valor: "A", rotulo: "A (moto)" },
  { valor: "B", rotulo: "B ou mais" },
  { valor: "C", rotulo: "C ou mais" },
  { valor: "D", rotulo: "D ou mais" },
  { valor: "E", rotulo: "E" },
];
export const PRETENSOES_FILTRO = PRETENSOES.filter((p) => p.valor && p.valor < 10000).map((p) => ({
  valor: String(p.valor),
  rotulo: `Até R$ ${p.valor.toLocaleString("pt-BR")}`,
}));
export const CONTRATOS_FILTRO = ["CLT", "Temporário", "Terceirizado", "PJ"].map((c) => ({ valor: c, rotulo: c }));
