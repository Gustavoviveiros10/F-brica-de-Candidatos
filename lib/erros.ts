// Traduz os códigos lançados pelas funções do banco em mensagens para a tela.
const MENSAGENS: Record<string, string> = {
  NAO_AUTENTICADO: "Sua sessão expirou. Entre de novo.",
  JA_VINCULADO: "Seu usuário já está ligado a uma empresa.",
  CNPJ_INVALIDO: "CNPJ inválido. Confira os 14 números.",
  CNPJ_JA_CADASTRADO: "Esse CNPJ já tem conta. Peça acesso a quem cadastrou a empresa.",
  SEM_EMPRESA: "Complete o cadastro da empresa para liberar contatos.",
  EMPRESA_BLOQUEADA: "A conta da empresa está bloqueada. Fale com o suporte.",
  CANDIDATO_INDISPONIVEL: "Esse candidato não está mais disponível.",
  SO_ADMIN_DA_EMPRESA: "Só o administrador da empresa pode mudar esses dados.",
  SEM_CREDITOS: "Seus créditos acabaram. Escolha um plano para continuar liberando.",
};

export function mensagemErro(e: { message?: string } | null | undefined, padrao = "Algo deu errado. Tente de novo.") {
  const msg = e?.message ?? "";
  const codigo = Object.keys(MENSAGENS).find((c) => msg.includes(c));
  return codigo ? MENSAGENS[codigo] : padrao;
}
