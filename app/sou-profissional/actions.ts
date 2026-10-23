"use server";
import { supabaseServer } from "@/lib/supabase/server";
import {
  CONSENTIMENTO_VERSAO,
  FUNCAO_OUTRA,
  acharFuncao,
  emailValido,
  normalizarWhatsapp,
  type DadosCadastro,
} from "@/lib/cadastro-candidato";

export type Captacao = Partial<Record<"pagina" | "utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term" | "fbclid", string>>;
export type RespostaCadastro = { ok: true; novo: boolean; funcao: string } | { ok: false; erro: string };

const ERROS: Record<string, string> = {
  WHATSAPP_INVALIDO: "Confira o WhatsApp: DDD + número de celular.",
  NOME_INVALIDO: "Escreva seu nome completo.",
  EMAIL_INVALIDO: "Confira o e-mail ou deixe em branco.",
  FUNCAO_INVALIDA: "Escolha sua função na lista.",
  CIDADE_INVALIDA: "Escolha sua cidade na lista.",
  SEM_CONSENTIMENTO: "Para continuar, marque que concorda em compartilhar seu perfil.",
  RESPOSTAS_INCOMPLETAS: "Faltou responder alguma pergunta da sua experiência. Volte e confira.",
  EXPERIENCIA_INVALIDA: "Diga quanto tempo de experiência você tem.",
  ESCOLARIDADE_INVALIDA: "Escolha até onde você estudou.",
  DISPONIBILIDADE_INVALIDA: "Diga quando você pode começar.",
  SITUACAO_INVALIDA: "Diga se está trabalhando agora.",
  TURNO_INVALIDO: "Marque pelo menos um turno.",
  CONTRATO_INVALIDO: "Marque pelo menos um tipo de contrato.",
  CURSO_INVALIDO: "Escreva qual é o seu curso e se está completo ou cursando.",
  AGUARDE: "Seu cadastro acabou de ser enviado. Espere um minuto antes de enviar de novo.",
};

export async function enviarCadastro(dados: DadosCadastro, captacao: Captacao, armadilha: string): Promise<RespostaCadastro> {
  // Campo invisível: gente de verdade não preenche, robô sim. Finge que deu certo.
  if (armadilha) return { ok: true, novo: true, funcao: "" };

  const whatsapp = normalizarWhatsapp(dados.whatsapp);
  if (!whatsapp) return { ok: false, erro: ERROS.WHATSAPP_INVALIDO };
  if (!acharFuncao(dados.funcao_id)) return { ok: false, erro: ERROS.FUNCAO_INVALIDA };
  if (dados.funcao_id === FUNCAO_OUTRA && dados.funcao_informada.trim().length < 3) return { ok: false, erro: "Escreva qual é a sua função." };
  if (!dados.municipio_id) return { ok: false, erro: ERROS.CIDADE_INVALIDA };
  if (dados.nome.trim().length < 3) return { ok: false, erro: ERROS.NOME_INVALIDO };
  if (!emailValido(dados.email.trim())) return { ok: false, erro: ERROS.EMAIL_INVALIDO };
  if (!dados.consentimento) return { ok: false, erro: ERROS.SEM_CONSENTIMENTO };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("cadastrar_candidato", {
    p: { ...dados, whatsapp, consentimento_versao: CONSENTIMENTO_VERSAO, ...captacao },
  });
  if (error) {
    const codigo = Object.keys(ERROS).find((k) => error.message.includes(k));
    return { ok: false, erro: codigo ? ERROS[codigo] : "Não deu para enviar agora. Tente de novo em instantes." };
  }
  const r = data as { novo: boolean; funcao: string };
  return { ok: true, novo: r.novo, funcao: r.funcao };
}
