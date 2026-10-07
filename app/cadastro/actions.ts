"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { criarEmpresa, lerDadosEmpresa } from "@/lib/empresa";
import { origemSite } from "@/lib/origem";
import type { EstadoForm } from "../entrar/actions";

export async function cadastrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const dados = lerDadosEmpresa(form);
  if ("erro" in dados) return dados;
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (form.get("termos") !== "on") return { erro: "Aceite os termos de uso e a política de privacidade." };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      emailRedirectTo: `${await origemSite()}/auth/callback?next=/app`,
      // Guardado no usuário para concluir o cadastro depois da confirmação do e-mail.
      data: { ...dados, termos_aceitos_em: new Date().toISOString() },
    },
  });
  if (error) {
    if (error.code === "user_already_exists") return { erro: "Esse e-mail já tem conta. Entre ou recupere a senha." };
    if (error.code === "weak_password") return { erro: "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números." };
    if (error.code === "over_email_send_rate_limit") return { erro: "Muitas tentativas. Espere alguns minutos e tente de novo." };
    return { erro: "Não foi possível criar a conta. Tente de novo." };
  }

  if (!data.session) {
    return { ok: `Enviamos um link de confirmação para ${email}. Clique nele para ativar a conta.` };
  }
  const erro = await criarEmpresa(dados);
  redirect(erro ? "/completar-cadastro" : "/app?bemvindo=1");
}
