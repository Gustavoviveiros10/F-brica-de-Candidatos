"use server";
import { revalidatePath } from "next/cache";
import { mensagemErro } from "@/lib/erros";
import { supabaseServer } from "@/lib/supabase/server";
import type { EstadoForm } from "@/app/entrar/actions";

export async function salvarEmpresa(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const tel = String(form.get("whatsapp") ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (tel.length < 10 || tel.length > 11) return { erro: "WhatsApp inválido. Use DDD + número." };
  const mensagem = String(form.get("mensagem") ?? "").trim();
  if (mensagem.length > 600) return { erro: "A mensagem pode ter até 600 caracteres." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("atualizar_empresa", {
    p_nome: String(form.get("empresa") ?? ""),
    p_whatsapp: "+55" + tel,
    p_municipio_id: Number(form.get("municipio_id")) || null,
    p_mensagem_whatsapp: mensagem,
  });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/app", "layout");
  return { ok: "Dados da empresa salvos." };
}

export async function salvarMeusDados(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const nome = String(form.get("nome") ?? "").trim();
  if (!nome) return { erro: "Preencha seu nome." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("atualizar_meu_nome", { p_nome: nome });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/app", "layout");
  return { ok: "Seu nome foi atualizado." };
}

export async function trocarSenhaLogado(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const senha = String(form.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== String(form.get("confirmacao") ?? "")) return { erro: "As duas senhas não são iguais." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    if (error.code === "same_password") return { erro: "Use uma senha diferente da atual." };
    if (error.code === "weak_password") return { erro: "Senha fraca. Misture letras e números." };
    return { erro: "Não foi possível trocar a senha. Tente de novo." };
  }
  return { ok: "Senha alterada." };
}
