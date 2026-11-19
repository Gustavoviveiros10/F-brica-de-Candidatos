"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { MAX_CREDITOS, MIN_CREDITOS } from "@/lib/precos";

// O Mercado Pago é chamado pela Edge Function mp-checkout (no Supabase), onde fica o Access Token.
export async function comprar(form: FormData) {
  const quantidade = Math.round(Number(form.get("quantidade")));
  if (!Number.isFinite(quantidade) || quantidade < MIN_CREDITOS || quantidade > MAX_CREDITOS) {
    redirect("/app/creditos?erro=QUANTIDADE_INVALIDA");
  }
  const supabase = await supabaseServer();
  const { data, error } = await supabase.functions.invoke<{ url?: string }>("mp-checkout", { body: { acao: "comprar", quantidade } });
  if (!error && data?.url) redirect(data.url);
  let codigo = "MERCADO_PAGO_FALHOU";
  const resposta = (error as { context?: unknown } | null)?.context;
  if (resposta instanceof Response) {
    const r = (await resposta.json().catch(() => null)) as { erro?: string } | null;
    if (r?.erro) codigo = r.erro;
  }
  redirect(`/app/creditos?erro=${codigo}`);
}
