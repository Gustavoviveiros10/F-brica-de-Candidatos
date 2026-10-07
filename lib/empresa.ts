import { supabaseServer } from "./supabase/server";
import { mensagemErro } from "./erros";

export type DadosEmpresa = { empresa: string; cnpj: string; whatsapp: string; municipio_id: number; nome: string };

export function lerDadosEmpresa(form: FormData): DadosEmpresa | { erro: string } {
  const empresa = String(form.get("empresa") ?? "").trim();
  const cnpj = String(form.get("cnpj") ?? "").replace(/\D/g, "");
  const tel = String(form.get("whatsapp") ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const municipio_id = Number(form.get("municipio_id"));
  const nome = String(form.get("nome") ?? "").trim();
  if (!empresa || !nome) return { erro: "Preencha seu nome e o nome da empresa." };
  if (cnpj.length !== 14) return { erro: "CNPJ inválido. Confira os 14 números." };
  if (tel.length < 10 || tel.length > 11) return { erro: "WhatsApp inválido. Use DDD + número." };
  if (!municipio_id) return { erro: "Selecione a cidade da empresa." };
  return { empresa, cnpj, whatsapp: "+55" + tel, municipio_id, nome };
}

// Cria a empresa e vincula o usuário logado (ganha os 2 contatos grátis no banco).
export async function criarEmpresa(d: DadosEmpresa): Promise<string | null> {
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("cadastrar_empresa", {
    p_nome_empresa: d.empresa,
    p_cnpj: d.cnpj,
    p_municipio_id: d.municipio_id,
    p_whatsapp: d.whatsapp,
    p_nome_usuario: d.nome,
  });
  return error ? mensagemErro(error) : null;
}
