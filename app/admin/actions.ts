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
  const metodo = String(form.get("metodo") ?? "pix");
  const valorTexto = String(form.get("valor") ?? "").replace(/[^\d,]/g, "").replace(",", ".");
  const valor = valorTexto ? Math.round(Number(valorTexto) * 100) : null;
  if (!plano) return { erro: "Escolha o plano." };
  if (valor !== null && (!Number.isFinite(valor) || valor > 10000000)) return { erro: "Confira o valor recebido." };
  if (!motivo) return { erro: "Escreva uma observação, ex.: Pix de 15/10." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_ativar_plano", {
    p_empresa_id: String(form.get("empresa_id")),
    p_plano_id: plano,
    p_justificativa: motivo,
    p_metodo: metodo,
    p_valor_centavos: valor,
  });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/admin", "layout");
  return { ok: `Plano ativado e pagamento registrado. Saldo agora: ${data} créditos.` };
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

export async function cancelarPlano(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("admin_cancelar_plano", { p_empresa_id: String(form.get("empresa_id")) });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/admin", "layout");
  return { ok: "Plano cancelado. Os créditos que sobraram continuam com a empresa." };
}

export async function ocultarCandidato(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const ativo = form.get("ativo") === "1";
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("admin_ocultar_candidato", { p_id: String(form.get("candidato_id")), p_ativo: ativo });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath("/admin", "layout");
  return { ok: ativo ? "Pronto. O candidato voltou para a busca das empresas." : "Pronto. O candidato não aparece mais na busca das empresas." };
}
