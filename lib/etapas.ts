// Etapas do funil de contratação, na ordem em que aparecem no CRM.
export const ETAPAS: { id: string; nome: string }[] = [
  { id: "novo", nome: "Novo" },
  { id: "contatado", nome: "Contatado" },
  { id: "conversando", nome: "Conversando" },
  { id: "entrevista", nome: "Entrevista" },
  { id: "aprovado", nome: "Aprovado" },
  { id: "contratado", nome: "Contratado" },
  { id: "descartado", nome: "Descartado" },
];
export const NOME_ETAPA = Object.fromEntries(ETAPAS.map((e) => [e.id, e.nome]));
