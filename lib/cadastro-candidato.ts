// Opções fechadas do cadastro de candidato (landing dos anúncios).
// Os valores gravados são exatamente os que a busca das empresas filtra,
// e o banco confere tudo de novo em cadastrar_candidato.

export type FuncaoCadastro = { id: number; nome: string; habilidades: string[]; cursos: string[] };

export const AREAS: { id: string; nome: string; texto: string; foto: string }[] = [
  { id: "producao", nome: "Produção e qualidade", texto: "Linha, montagem, inspeção", foto: "/img/foto-line.jpg" },
  { id: "logistica", nome: "Logística", texto: "Almoxarifado, expedição, motorista", foto: "/img/foto-truck.jpg" },
  { id: "empilhadeira", nome: "Empilhadeira", texto: "Empilhadeira e ponte rolante", foto: "/img/foto-forklift.jpg" },
  { id: "manutencao", nome: "Manutenção", texto: "Mecânica, elétrica, refrigeração", foto: "/img/foto-maint.jpg" },
  { id: "ferramentaria", nome: "Ferramentaria e usinagem", texto: "CNC, torno, moldes", foto: "/img/foto-tool.jpg" },
  { id: "solda", nome: "Solda", texto: "MIG/MAG, TIG, caldeiraria", foto: "/img/foto-weld.jpg" },
];

// Copiado da tabela funcoes (categoria ≠ outros). Se criar função nova no banco, inclua aqui.
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
  ],
  logistica: [
    { id: 22, nome: "Auxiliar Logístico", habilidades: ["Rebocador", "Separação de pedidos", "Coletor de dados", "Almoxarifado"], cursos: ["NR-11", "Operador de Empilhadeira"] },
    { id: 21, nome: "Auxiliar de Expedição", habilidades: ["Separação de pedidos", "Coletor de dados", "Paletização"], cursos: ["NR-11", "Rotinas de logística"] },
    { id: 30, nome: "Assistente de Logística", habilidades: ["Logística", "Notas fiscais", "Separação de pedidos"], cursos: ["NR-11"] },
    { id: 20, nome: "Motorista Entregador", habilidades: ["Entregas de carro", "Rota urbana"], cursos: ["Direção defensiva"] },
    { id: 19, nome: "Motorista de Caminhão", habilidades: ["Carga fracionada", "Rota regional", "Munck"], cursos: ["MOPP", "Direção defensiva"] },
    { id: 17, nome: "Motorista de Caminhão Truck", habilidades: ["Carga fracionada", "Rota regional", "Carga e descarga"], cursos: ["MOPP", "Direção defensiva"] },
    { id: 18, nome: "Motorista de Carreta", habilidades: ["Carga seca", "Rota interestadual", "Rastreamento"], cursos: ["MOPP", "Direção defensiva"] },
  ],
  empilhadeira: [
    { id: 1, nome: "Operador de Empilhadeira", habilidades: ["Empilhadeira elétrica", "Empilhadeira a gás", "Empilhadeira retrátil", "Paleteira elétrica"], cursos: ["NR-11", "NR-12", "Operador de movimentação de carga"] },
    { id: 2, nome: "Operador de Ponte Rolante", habilidades: ["Ponte rolante", "Talha elétrica", "Sinalização de carga"], cursos: ["NR-11", "NR-35", "Operador de ponte rolante"] },
  ],
  manutencao: [
    { id: 33, nome: "Auxiliar de Manutenção", habilidades: ["Manutenção preventiva e corretiva", "Hidráulica"], cursos: ["NR-12"] },
    { id: 12, nome: "Mecânico de Manutenção", habilidades: ["Hidráulica", "Pneumática", "Alinhamento de eixos", "Manutenção preventiva"], cursos: ["Mecânica industrial", "NR-12"] },
    { id: 13, nome: "Eletricista Industrial", habilidades: ["Comandos elétricos", "Painéis", "Inversores de frequência", "Manutenção corretiva"], cursos: ["NR-10", "NR-10 SEP", "Eletrotécnica"] },
    { id: 14, nome: "Técnico em Manutenção Industrial", habilidades: ["CLP / PLC", "Hidráulica", "Elétrica industrial", "Planejamento de manutenção"], cursos: ["Técnico em Eletromecânica", "NR-10", "NR-12"] },
    { id: 34, nome: "Planejador de Manutenção", habilidades: ["Planejamento de manutenção", "PCM"], cursos: ["NR-12"] },
    { id: 15, nome: "Mecânico Automotivo", habilidades: ["Mecânica automotiva", "Diagnóstico"], cursos: ["Mecânica automotiva"] },
    { id: 16, nome: "Mecânico de Refrigeração", habilidades: ["Refrigeração", "Ar-condicionado"], cursos: ["Refrigeração"] },
  ],
  ferramentaria: [
    { id: 8, nome: "Auxiliar de Ferramentaria", habilidades: ["Troca de moldes", "Ajustagem"], cursos: ["Leitura de desenho técnico"] },
    { id: 5, nome: "Operador CNC", habilidades: ["Centro de usinagem", "Torno CNC", "Programação ISO", "Setup de máquina"], cursos: ["Operador CNC", "Leitura de desenho técnico", "Metrologia"] },
    { id: 7, nome: "Programador CNC", habilidades: ["Programação ISO", "CAM", "Torno CNC"], cursos: ["Programação CNC"] },
    { id: 32, nome: "Operador de Usinagem", habilidades: ["Usinagem", "Torno convencional", "Metrologia"], cursos: ["Leitura de desenho técnico"] },
    { id: 6, nome: "Torneiro Mecânico", habilidades: ["Torno convencional", "Torno CNC", "Metrologia"], cursos: ["Senai - Torneiro", "Leitura de desenho técnico"] },
    { id: 3, nome: "Ferramenteiro de Moldes", habilidades: ["Moldes plásticos", "Ajustagem", "Metrologia", "Polimento de moldes"], cursos: ["Senai - Ferramentaria", "Leitura de desenho técnico"] },
    { id: 4, nome: "Ferramenteiro de Bancada", habilidades: ["Ajustagem", "Estampos", "Metrologia"], cursos: ["Senai - Ferramentaria", "Leitura de desenho técnico"] },
  ],
  solda: [
    { id: 31, nome: "Soldador", habilidades: ["Solda em chapa", "Solda estrutural", "Solda oxiacetileno"], cursos: ["NR-18"] },
    { id: 9, nome: "Soldador MIG/MAG", habilidades: ["MIG/MAG", "Leitura de desenho", "Solda em chapa", "Solda estrutural"], cursos: ["Soldador MIG/MAG", "Inspetor de solda", "NR-18"] },
    { id: 10, nome: "Soldador TIG", habilidades: ["TIG", "Aço inox", "Alumínio", "Eletrodo revestido"], cursos: ["Soldador TIG", "Qualificação de soldador"] },
    { id: 11, nome: "Caldeireiro", habilidades: ["Traçagem", "Corte plasma", "Montagem estrutural"], cursos: ["Caldeiraria", "Leitura de desenho técnico"] },
  ],
};

// Cursos que qualquer função pode marcar, além dos sugeridos da função.
export const CURSOS_GERAIS = ["NR-10", "NR-11", "NR-12", "NR-33", "NR-35", "Operador de Empilhadeira"];

export function cursosDa(f: FuncaoCadastro) {
  return [...new Set([...f.cursos, ...CURSOS_GERAIS])];
}

export function acharFuncao(id: number) {
  for (const [area, lista] of Object.entries(FUNCOES)) {
    const f = lista.find((x) => x.id === id);
    if (f) return { area, ...f };
  }
  return null;
}

export const EXPERIENCIAS = [
  { valor: 0, rotulo: "Ainda não tenho" },
  { valor: 1, rotulo: "Menos de 2 anos" },
  { valor: 2, rotulo: "2 a 4 anos" },
  { valor: 5, rotulo: "5 a 9 anos" },
  { valor: 10, rotulo: "10 anos ou mais" },
];

// Mesmos textos do filtro "Formação" da busca.
export const ESCOLARIDADES = [
  { valor: "Ensino fundamental", rotulo: "Fundamental (ou médio incompleto)" },
  { valor: "Ensino médio completo", rotulo: "Médio completo" },
  { valor: "Técnico", rotulo: "Curso técnico" },
  { valor: "Superior", rotulo: "Faculdade" },
];

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
  { valor: "imediata", rotulo: "Posso começar já" },
  { valor: "15_dias", rotulo: "Em até 15 dias" },
  { valor: "30_dias", rotulo: "Em até 30 dias" },
];

export const TURNOS = [
  { valor: "qualquer", rotulo: "Qualquer turno" },
  { valor: "1_turno", rotulo: "1º turno" },
  { valor: "2_turno", rotulo: "2º turno" },
  { valor: "3_turno", rotulo: "3º turno" },
  { valor: "comercial", rotulo: "Comercial" },
];

export const CONTRATOS = [
  { valor: "CLT", rotulo: "CLT (carteira assinada)" },
  { valor: "Temporário", rotulo: "Temporário" },
  { valor: "PJ", rotulo: "PJ" },
];

export const SITUACOES = [
  { valor: "desempregado", rotulo: "Estou sem trabalho" },
  { valor: "empregado_aberto", rotulo: "Trabalhando, mas aberto a propostas" },
];

// Faixas: grava o teto da faixa, que é o que o filtro "pretensão até" compara.
export const PRETENSOES = [
  { valor: 0, rotulo: "Prefiro não dizer" },
  { valor: 2000, rotulo: "Até R$ 2.000" },
  { valor: 2500, rotulo: "R$ 2.001 a 2.500" },
  { valor: 3000, rotulo: "R$ 2.501 a 3.000" },
  { valor: 4000, rotulo: "R$ 3.001 a 4.000" },
  { valor: 5000, rotulo: "R$ 4.001 a 5.000" },
  { valor: 7000, rotulo: "Acima de R$ 5.000" },
];

// Versão do texto de consentimento mostrado no formulário (LGPD).
export const CONSENTIMENTO_VERSAO = "candidato-v1-2026-10";

export type DadosCadastro = {
  funcao_id: number;
  municipio_id: number;
  bairro: string;
  experiencia_anos: number;
  escolaridade: string;
  cnh: string;
  habilidades: string[];
  cursos: string[];
  disponibilidade: string;
  turno: string;
  contratos: string[];
  situacao: string;
  pretensao_salarial: number;
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
