// Dados do perfil que ajudam a decidir (nunca trazem contato).
export type PerfilCandidato = {
  id: string;
  funcao: string;
  categoria: string;
  cidade: string;
  uf: string;
  distancia_km?: number | null;
  experiencia_anos: number | null;
  escolaridade: string | null;
  turno: string | null;
  contratos: string[] | null;
  disponibilidade: string;
  temperatura: string;
  pretensao_salarial: number | null;
  situacao: string | null;
  cnh: string | null;
  habilidades: string[] | null;
  cursos: string[] | null;
  tem_cv: boolean;
  atualizado_ha_dias: number;
  // Só o primeiro nome, liberado antes do crédito (primeiros_nomes no banco).
  primeiro_nome?: string | null;
};

// Linha devolvida por buscar_candidatos / meus_salvos.
export type Candidato = PerfilCandidato & {
  relacionado: boolean;
  ja_liberado: boolean;
  salvo: boolean;
  total: number;
};

// Linha devolvida por crm_liberados: perfil + contato + funil.
export type ContatoCrm = PerfilCandidato & {
  liberacao_id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  etapa: string;
  nota: string | null;
  liberado_em: string;
  total: number;
};
