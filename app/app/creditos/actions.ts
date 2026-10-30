"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

// O Mercado Pago é chamado pela Edge Function mp-checkout (no Supabase), onde fica o Access Token.

async function chamarCheckout(corpo: { acao: string; plano?: string }) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.functions.invoke<{ url?: string; ok?: boolean }>("mp-checkout", { body: corpo });
  if (!error) return { data };
  let codigo = "MERCADO_PAGO_FALHOU";
  const resposta = (error as { context?: unknown }).context;
  if (resposta instanceof Response) {
    const r = (await resposta.json().catch(() => null)) as { erro?: string } | null;
    if (r?.erro) codigo = r.erro;
  }
  return { codigo };
}

export async function pagar(form: FormData) {
  const acao = form.get("acao") === "mes" ? "mes" : "assinar";
  const { data, codigo } = await chamarCheckout({ acao, plano: String(form.get("plano") ?? "") });
  if (!data?.url) redirect(`/app/creditos?erro=${codigo ?? "MERCADO_PAGO_FALHOU"}`);
  redirect(data.url);
}

export async function cancelarAssinatura() {
  const { codigo } = await chamarCheckout({ acao: "cancelar" });
  revalidatePath("/app", "layout");
  redirect(codigo ? `/app/creditos?erro=${codigo}` : "/app/creditos?pagamento=cancelado");
}
