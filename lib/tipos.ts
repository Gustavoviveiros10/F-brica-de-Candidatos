// Linha devolvida por buscar_candidatos (nunca traz contato).
export type Candidato = {
  id: string;
  funcao: string;
  categoria: string;
  cidade: string;
  uf: string;
  distancia_km: number | null;
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
  relacionado: boolean;
  ja_liberado: boolean;
  salvo: boolean;
  total: number;
};
