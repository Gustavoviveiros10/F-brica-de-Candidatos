"use server";
import { revalidatePath } from "next/cache";
import { mensagemErro } from "@/lib/erros";
import { supabaseServer } from "@/lib/supabase/server";
import type { EstadoForm } from "@/app/entrar/actions";

// Todas as ações chamam funções do banco que conferem se quem pede é admin.

export async function ajustarCreditos(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const delta = Number(String(form.get("delta") ?? "").replace(/\s/g, ""));
  const motivo = String(form.get("motivo") ?? "").trim();
  if (!Number.isInteger(delta) || delta === 0) return { erro: "Informe quantos créditos, ex.: 10 ou -5." };
  if (Math.abs(delta) > 5000) return { erro: "Valor alto demais. Confira o número." };
  if (!motivo) return { erro: "Escreva o motivo. Ele aparece no extrato da empresa." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_ajustar_creditos", {
    p_empresa_id: String(form.get("empresa_id")),
    p_delta: delta,
    p_justificativa: motivo,
  });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/admin", "layout");
  return { ok: `Pronto. Saldo agora: ${data} ${data === 1 ? "crédito" : "créditos"}.` };
}

export async function ativarPlano(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const plano = String(form.get("plano") ?? "");
  const motivo = String(form.get("motivo") ?? "").trim();
  if (!plano) return { erro: "Escolha o plano." };
  if (!motivo) return { erro: "Escreva como foi pago, ex.: Pix de 15/10." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_ativar_plano", {
    p_empresa_id: String(form.get("empresa_id")),
    p_plano_id: plano,
    p_justificativa: motivo,
  });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/admin", "layout");
  return { ok: `Plano ativado. Saldo agora: ${data} créditos.` };
}

export async function definirStatus(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("admin_definir_status", {
    p_empresa_id: String(form.get("empresa_id")),
    p_status: String(form.get("status") ?? ""),
  });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/admin", "layout");
  return { ok: "Status atualizado." };
}
