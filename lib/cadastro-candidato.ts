// Opções fechadas do cadastro de candidato (landing dos anúncios).
// Os valores gravados são exatamente os que a busca das empresas filtra,
// e o banco confere tudo de novo em cadastrar_candidato.

export type FuncaoCadastro = { id: number; nome: string; habilidades: string[]; cursos: string[] };

export const AREAS: { id: string; nome: string }[] = [
  { id: "producao", nome: "Produção e qualidade" },
  { id: "logistica", nome: "Logística" },
  { id: "empilhadeira", nome: "Empilhadeira e movimentação" },
  { id: "manutencao", nome: "Manutenção" },
  { id: "ferramentaria", nome: "Ferramentaria e usinagem" },
  { id: "solda", nome: "Solda e caldeiraria" },
];

// Copiado da tabela funcoes (categoria ≠ outros), mais as funções novas da migration 16 (ids 105+).
// Se criar função nova no banco, inclua aqui.
export const FUNCOES: Record<string, FuncaoCadastro[]> = {
  producao: [
    { id: 29, nome: "Ajudante Geral", habilidades: ["Produção", "Carga e descarga"], cursos: ["NR-12"] },
    { id: 23, nome: "Auxiliar de Produção", habilidades: ["Linha de montagem", "5S", "Inspeção visual"], cursos: ["NR-12", "Boas práticas de produção"] },
    { id: 24, nome: "Operador de Produção", habilidades: ["Máquina injetora", "Linha de produção", "Máquina de costura", "Rebarba"], cursos: ["NR-12", "Boas práticas de produção"] },
    { id: 26, nome: "Operador de Montagem", habilidades: ["Montagem", "Linha de montagem"], cursos: ["NR-12", "NR-10"] },
    { id: 25, nome: "Operador de Prensa", habilidades: ["Prensa excêntrica", "Prensa hidráulica", "Troca de ferramental"], cursos: ["NR-12", "Operador de prensa"] },
    { id: 27, nome: "Inspetor de Qualidade", habilidades: ["Metrologia", "Instrumentos de medição", "Plano de controle"], cursos: ["Inspetor de qualidade", "Leitura de desenho técnico"] },
    { id: 35, nome: "Metrologista", habilidades: ["Metrologia", "Máquina de medição tridimensional"], cursos: ["Leitura de desenho técnico"] },
    { id: 28, nome: "Líder de Produção", habilidades: ["Liderança de equipe", "Gestão de linha"], cursos: ["NR-12"] },
    { id: 105, nome: "Operador de Máquinas", habilidades: ["Setup de máquina", "Linha de produção", "Leitura de desenho"], cursos: ["NR-12"] },
    { id: 106, nome: "Operador de Injetora", habilidades: ["Máquina injetora", "Troca de moldes", "Setup de máquina"], cursos: ["NR-12"] },
    { id: 107, nome: "Operador de Extrusora", habilidades: ["Extrusora", "Setup de máquina", "Linha de produção"], cursos: ["NR-12"] },
    { id: 108, nome: "Rebarbador", habilidades: ["Rebarba", "Esmerilhadeira", "Lixadeira"], cursos: ["NR-12"] },
    { id: 109, nome: "Embalador", habilidades: ["Embalagem", "Paletização", "5S"], cursos: ["Boas práticas de produção"] },
    { id: 110, nome: "Abastecedor de Linha", habilidades: ["Abastecimento de linha", "Rebocador", "Coletor de dados"], cursos: ["NR-11"] },
    { id: 111, nome: "Pintor Industrial", habilidades: ["Pintura a pistola", "Pintura eletrostática", "Preparação de superfície"], cursos: ["NR-12"] },
    { id: 112, nome: "Costureira Industrial", habilidades: ["Máquina de costura reta", "Overloque", "Galoneira"], cursos: ["Boas práticas de produção"] },
    { id: 113, nome: "Operador de Dobradeira", habilidades: ["Dobradeira", "Leitura de desenho", "Instrumentos de medição"], cursos: ["NR-12"] },
    { id: 114, nome: "Operador de Corte a Laser", habilidades: ["Corte a laser", "Leitura de desenho", "Setup de máquina"], cursos: ["NR-12"] },
    { id: 118, nome: "Operador de Galvanoplastia", habilidades: ["Banhos galvânicos", "Zincagem"], cursos: ["NR-12"] },
    { id: 115, nome: "Auxiliar de Qualidade", habilidades: ["Inspeção visual", "Instrumentos de medição"], cursos: ["Inspetor de qualidade"] },
    { id: 116, nome: "Técnico de Qualidade", habilidades: ["Metrologia", "Plano de controle", "Core tools (APQP, PPAP, FMEA)", "Ferramentas da qualidade"], cursos: ["Inspetor de qualidade", "Leitura de desenho técnico"] },
    { id: 117, nome: "Supervisor de Produção", habilidades: ["Liderança de equipe", "Gestão de linha", "Indicadores de produção"], cursos: ["NR-12"] },
  ],
  logistica: [
    { id: 22, nome: "Auxiliar Logístico", habilidades: ["Rebocador", "Separação de pedidos", "Coletor de dados", "Almoxarifado"], cursos: ["NR-11", "Operador de Empilhadeira"] },
    { id: 21, nome: "Auxiliar de Expedição", habilidades: ["Separação de pedidos", "Coletor de dados", "Paletização"], cursos: ["NR-11", "Rotinas de logística"] },
    { id: 30, nome: "Assistente de Logística", habilidades: ["Logística", "Notas fiscais", "Separação de pedidos"], cursos: ["NR-11"] },
    { id: 20, nome: "Motorista Entregador", habilidades: ["Entregas de carro", "Rota urbana"], cursos: ["Direção defensiva"] },
    { id: 19, nome: "Motorista de Caminhão", habilidades: ["Carga fracionada", "Rota regional", "Munck"], cursos: ["MOPP", "Direção defensiva"] },
    { id: 17, nome: "Motorista de Caminhão Truck", habilidades: ["Carga fracionada", "Rota regional", "Carga e descarga"], cursos: ["MOPP", "Direção defensiva"] },
    { id: 18, nome: "Motorista de Carreta", habilidades: ["Carga seca", "Rota interestadual", "Rastreamento"], cursos: ["MOPP", "Direção defensiva"] },
    { id: 119, nome: "Almoxarife", habilidades: ["Almoxarifado", "Controle de estoque", "Coletor de dados", "Notas fiscais"], cursos: ["NR-11"] },
    { id: 120, nome: "Conferente", habilidades: ["Conferência de carga", "Notas fiscais", "Coletor de dados"], cursos: ["NR-11"] },
    { id: 121, nome: "Separador de Pedidos", habilidades: ["Separação de pedidos", "Coletor de dados", "Paletização"], cursos: ["NR-11"] },
    { id: 122, nome: "Ajudante de Carga e Descarga", habilidades: ["Carga e descarga", "Paletização"], cursos: ["NR-11"] },
    { id: 123, nome: "Motorista Operador de Munck", habilidades: ["Munck", "Carga e descarga", "Rota regional"], cursos: ["MOPP", "Direção defensiva", "NR-11"] },
  ],
  empilhadeira: [
    { id: 1, nome: "Operador de Empilhadeira", habilidades: ["Empilhadeira elétrica", "Empilhadeira a gás", "Empilhadeira retrátil", "Paleteira elétrica"], cursos: ["NR-11", "NR-12", "Operador de movimentação de carga"] },
    { id: 2, nome: "Operador de Ponte Rolante", habilidades: ["Ponte rolante", "Talha elétrica", "Sinalização de carga"], cursos: ["NR-11", "NR-35", "Operador de ponte rolante"] },
    { id: 124, nome: "Operador de Rebocador", habilidades: ["Rebocador", "Abastecimento de linha"], cursos: ["NR-11"] },
    { id: 125, nome: "Operador de Paleteira Elétrica", habilidades: ["Paleteira elétrica", "Separação de pedidos"], cursos: ["NR-11"] },
  ],
  manutencao: [
    { id: 33, nome: "Auxiliar de Manutenção", habilidades: ["Manutenção preventiva e corretiva", "Hidráulica"], cursos: ["NR-12"] },
    { id: 12, nome: "Mecânico de Manutenção", habilidades: ["Hidráulica", "Pneumática", "Alinhamento de eixos", "Manutenção preventiva"], cursos: ["Mecânica industrial", "NR-12"] },
    { id: 13, nome: "Eletricista Industrial", habilidades: ["Comandos elétricos", "Painéis", "Inversores de frequência", "Manutenção corretiva"], cursos: ["NR-10", "NR-10 SEP", "Eletrotécnica"] },
    { id: 14, nome: "Técnico em Manutenção Industrial", habilidades: ["CLP / PLC", "Hidráulica", "Elétrica industrial", "Planejamento de manutenção"], cursos: ["Técnico em Eletromecânica", "NR-10", "NR-12"] },
    { id: 34, nome: "Planejador de Manutenção", habilidades: ["Planejamento de manutenção", "PCM"], cursos: ["NR-12"] },
    { id: 15, nome: "Mecânico Automotivo", habilidades: ["Mecânica automotiva", "Diagnóstico"], cursos: ["Mecânica automotiva"] },
    { id: 16, nome: "Mecânico de Refrigeração", habilidades: ["Refrigeração", "Ar-condicionado"], cursos: ["Refrigeração"] },
    { id: 126, nome: "Mecânico Montador", habilidades: ["Montagem de máquinas", "Leitura de desenho", "Hidráulica", "Pneumática"], cursos: ["Mecânica industrial", "NR-12"] },
    { id: 127, nome: "Técnico em Eletrônica", habilidades: ["Eletrônica industrial", "CLP / PLC", "Inversores de frequência"], cursos: ["NR-10"] },
    { id: 128, nome: "Técnico em Mecatrônica", habilidades: ["CLP / PLC", "Robótica", "Pneumática", "Hidráulica"], cursos: ["NR-10", "NR-12"] },
    { id: 129, nome: "Lubrificador", habilidades: ["Lubrificação industrial", "Manutenção preventiva"], cursos: ["NR-12"] },
    { id: 130, nome: "Mecânico de Empilhadeira", habilidades: ["Mecânica de empilhadeira", "Diagnóstico", "Hidráulica"], cursos: ["NR-11", "NR-12"] },
  ],
  ferramentaria: [
    { id: 8, nome: "Auxiliar de Ferramentaria", habilidades: ["Troca de moldes", "Ajustagem"], cursos: ["Leitura de desenho técnico"] },
    { id: 5, nome: "Operador CNC", habilidades: ["Centro de usinagem", "Torno CNC", "Programação ISO", "Setup de máquina"], cursos: ["Operador CNC", "Leitura de desenho técnico", "Metrologia"] },
    { id: 7, nome: "Programador CNC", habilidades: ["Programação ISO", "CAM", "Torno CNC"], cursos: ["Programação CNC"] },
    { id: 32, nome: "Operador de Usinagem", habilidades: ["Usinagem", "Torno convencional", "Metrologia"], cursos: ["Leitura de desenho técnico"] },
    { id: 6, nome: "Torneiro Mecânico", habilidades: ["Torno convencional", "Torno CNC", "Metrologia"], cursos: ["Senai - Torneiro", "Leitura de desenho técnico"] },
    { id: 3, nome: "Ferramenteiro de Moldes", habilidades: ["Moldes plásticos", "Ajustagem", "Metrologia", "Polimento de moldes"], cursos: ["Senai - Ferramentaria", "Leitura de desenho técnico"] },
    { id: 4, nome: "Ferramenteiro de Bancada", habilidades: ["Ajustagem", "Estampos", "Metrologia"], cursos: ["Senai - Ferramentaria", "Leitura de desenho técnico"] },
    { id: 132, nome: "Fresador", habilidades: ["Fresadora convencional", "Fresadora CNC", "Leitura de desenho", "Metrologia"], cursos: ["Leitura de desenho técnico"] },
    { id: 133, nome: "Retificador", habilidades: ["Retífica plana", "Retífica cilíndrica", "Metrologia"], cursos: ["Leitura de desenho técnico"] },
    { id: 134, nome: "Ajustador Mecânico", habilidades: ["Ajustagem", "Leitura de desenho", "Metrologia"], cursos: ["Leitura de desenho técnico"] },
    { id: 135, nome: "Operador de Centro de Usinagem", habilidades: ["Centro de usinagem", "Setup de máquina", "Programação ISO"], cursos: ["Operador CNC"] },
  ],
  solda: [
    { id: 31, nome: "Soldador", habilidades: ["Solda em chapa", "Solda estrutural", "Solda oxiacetileno"], cursos: ["NR-18"] },
    { id: 9, nome: "Soldador MIG/MAG", habilidades: ["MIG/MAG", "Leitura de desenho", "Solda em chapa", "Solda estrutural"], cursos: ["Soldador MIG/MAG", "Inspetor de solda", "NR-18"] },
    { id: 10, nome: "Soldador TIG", habilidades: ["TIG", "Aço inox", "Alumínio", "Eletrodo revestido"], cursos: ["Soldador TIG", "Qualificação de soldador"] },
    { id: 11, nome: "Caldeireiro", habilidades: ["Traçagem", "Corte plasma", "Montagem estrutural"], cursos: ["Caldeiraria", "Leitura de desenho técnico"] },
    { id: 136, nome: "Serralheiro", habilidades: ["Serralheria", "MIG/MAG", "Corte e dobra"], cursos: ["NR-18", "NR-35"] },
    { id: 137, nome: "Montador de Estruturas Metálicas", habilidades: ["Montagem estrutural", "Leitura de desenho", "Trabalho em altura"], cursos: ["NR-35", "NR-18"] },
    { id: 138, nome: "Soldador de Eletrodo Revestido", habilidades: ["Eletrodo revestido", "Solda estrutural"], cursos: ["Qualificação de soldador"] },
    { id: 139, nome: "Maçariqueiro", habilidades: ["Corte com maçarico", "Solda oxiacetileno", "Traçagem"], cursos: ["NR-18"] },
  ],
};

// "Não achei minha função": grava nesta função (categoria outros) + o nome que a pessoa digitou.
export const FUNCAO_OUTRA = 140;

// Atalhos na tela: as funções que as fábricas do ABC mais procuram.
export const POPULARES = [29, 23, 105, 1, 22, 106, 9, 12, 13, 5, 27, 119, 120, 19, 3, 6];

export function acharFuncao(id: number) {
  if (id === FUNCAO_OUTRA) return { area: "outros", id, nome: "Outra função", habilidades: [] as string[], cursos: [] as string[] };
  for (const [area, lista] of Object.entries(FUNCOES)) {
    const f = lista.find((x) => x.id === id);
    if (f) return { area, ...f };
  }
  return null;
}

// Bloco comum (todas as vagas). Os textos são os valores gravados; o banco
// converte faixa de experiência e escolaridade nos valores que a busca filtra.
const op = (lista: string[]) => lista.map((v) => ({ valor: v, rotulo: v }));

export const EXPERIENCIAS = op(["Nunca trabalhei", "Menos de 6 meses", "6 meses a 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"]);

export const JA_INDUSTRIA = op(["Sim, com carteira assinada", "Sim, como temporário/terceiro", "Não"]);

export const SEGMENTOS = op([
  "Automotiva/autopeças", "Metalúrgica", "Plástico/borracha", "Química/tintas", "Alimentícia", "Farmacêutica/cosmética",
  "Embalagens/papel", "Eletroeletrônica", "Centro de distribuição/e-commerce", "Construção/montagem industrial", "Outra",
]);

export const ESCOLARIDADES = op([
  "Fundamental incompleto", "Fundamental completo", "Médio incompleto", "Médio completo",
  "Técnico (cursando ou completo)", "Superior (cursando ou completo)",
]);

export const CNHS = [
  { valor: "", rotulo: "Não tenho" },
  { valor: "A", rotulo: "A" },
  { valor: "B", rotulo: "B" },
  { valor: "AB", rotulo: "AB" },
  { valor: "C", rotulo: "C" },
  { valor: "D", rotulo: "D" },
  { valor: "E", rotulo: "E" },
];

export const DISPONIBILIDADES = [
  { valor: "imediata", rotulo: "Imediatamente" },
  { valor: "15_dias", rotulo: "Em até 15 dias" },
  { valor: "30_dias", rotulo: "Em até 30 dias" },
];

export const SITUACOES = [
  { valor: "desempregado", rotulo: "Não" },
  { valor: "empregado_aberto", rotulo: "Sim, mas quero mudar" },
  { valor: "empregado_temporario", rotulo: "Sim, em contrato temporário" },
];

export const TURNOS = [
  { valor: "1_turno", rotulo: "1º turno" },
  { valor: "2_turno", rotulo: "2º turno" },
  { valor: "3_turno", rotulo: "3º turno (noite)" },
  { valor: "comercial", rotulo: "Comercial" },
  { valor: "12x36", rotulo: "Escala 12x36" },
  { valor: "revezamento", rotulo: "Revezamento" },
];

export const CONTRATOS = [
  { valor: "CLT", rotulo: "CLT" },
  { valor: "Temporário", rotulo: "Temporário" },
  { valor: "Terceirizado", rotulo: "Terceirizado" },
  { valor: "PJ", rotulo: "PJ" },
];

// Faixas: grava o teto da faixa, que é o que o filtro "pretensão até" compara.
export const PRETENSOES = [
  { valor: 0, rotulo: "Prefiro não dizer" },
  { valor: 2000, rotulo: "Até R$ 2.000" },
  { valor: 2500, rotulo: "R$ 2.001 a 2.500" },
  { valor: 3000, rotulo: "R$ 2.501 a 3.000" },
  { valor: 4000, rotulo: "R$ 3.001 a 4.000" },
  { valor: 5000, rotulo: "R$ 4.001 a 5.000" },
  { valor: 7000, rotulo: "R$ 5.001 a 7.000" },
  { valor: 10000, rotulo: "Acima de R$ 7.000" },
];

export const PCD = [
  { valor: "nao", rotulo: "Não" },
  { valor: "sim", rotulo: "Sim" },
  { valor: "prefiro_nao_dizer", rotulo: "Prefiro não dizer" },
];

// Pergunta da vaga (tabela perguntas). Muda no banco, sem mexer no site.
export type PerguntaVaga = {
  codigo: string;
  familia: string;
  ordem: number;
  texto: string;
  dica: string | null;
  tipo: "uma" | "varias";
  opcoes: string[];
  opcao_nenhuma: string | null;
  so_funcoes: number[] | null;
  obrigatoria: boolean;
};

export type Resposta = string | string[];

export function perguntasDa(funcaoId: number, familia: string | undefined, todas: PerguntaVaga[]) {
  if (!familia) return [];
  return todas
    .filter((p) => p.familia === familia && (!p.so_funcoes || p.so_funcoes.includes(funcaoId)))
    .sort((a, b) => a.ordem - b.ordem);
}

export function respondida(p: PerguntaVaga, r: Resposta | undefined) {
  return p.tipo === "uma" ? typeof r === "string" && p.opcoes.includes(r) : Array.isArray(r) && r.length > 0;
}

// Versão do texto de consentimento mostrado no formulário (LGPD).
export const CONSENTIMENTO_VERSAO = "candidato-v1-2026-10";

export type DadosCadastro = {
  funcao_id: number;
  funcao_informada: string;
  municipio_id: number;
  bairro: string;
  experiencia_faixa: string;
  respostas: Record<string, Resposta>;
  ja_industria: string;
  segmentos: string[];
  escolaridade_nivel: string;
  cnh: string;
  disponibilidade: string;
  situacao: string;
  turnos: string[];
  contratos: string[];
  pretensao_salarial: number;
  pcd: string;
  nome: string;
  whatsapp: string;
  email: string;
  consentimento: boolean;
};

// (11) 91234-5678 → +5511912345678. Só aceita celular com DDD válido.
export function normalizarWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").replace(/^55(?=\d{11}$)/, "");
  if (!/^[1-9][1-9]9\d{8}$/.test(d)) return null;
  return `+55${d}`;
}

export function mascaraWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const emailValido = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const TODAS_FUNCOES = Object.entries(FUNCOES)
  .flatMap(([area, lista]) => lista.map((f) => ({ ...f, area })))
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
