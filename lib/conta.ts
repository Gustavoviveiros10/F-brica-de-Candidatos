import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  status: string;
  plano_id: number | null;
  municipio_id: number | null;
  saldo_creditos: number;
  mensagem_whatsapp: string | null;
  papel: string;
  usuario_nome: string;
};

export type Conta = { user_id: string | null; admin: boolean; empresa: Empresa | null };

// Uma chamada por request, compartilhada entre layout e página.
export const minhaConta = cache(async (): Promise<Conta> => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("minha_conta");
  if (error) throw new Error(error.message);
  return data as Conta;
});

// Para páginas dentro de /app: exige login e empresa vinculada.
export async function exigirEmpresa() {
  const conta = await minhaConta();
  if (!conta.user_id) redirect("/entrar");
  if (!conta.empresa) redirect("/completar-cadastro");
  return { ...conta, empresa: conta.empresa };
}
