// Recebe os avisos do Mercado Pago e lança os créditos comprados.
// Pública (sem login): o Mercado Pago não manda token do Supabase. Por isso nunca confiamos no
// conteúdo do aviso: usamos só o id e buscamos o pagamento na API do Mercado Pago com o nosso
// Access Token. O banco ainda confere se o valor pago bate com o preço da quantidade.
// Avisos repetidos não duplicam nada (gateway_pagamento_id é único).
import { createClient } from "npm:@supabase/supabase-js@2";
import { lerReferencia, mp, temToken } from "../_shared/mp.ts";

const banco = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const METODOS: Record<string, string> = {
  bank_transfer: "pix",
  ticket: "boleto",
  credit_card: "cartao",
  debit_card: "cartao",
  prepaid_card: "cartao",
};

async function rpc(nome: string, args: Record<string, unknown>) {
  const { error } = await banco.rpc(nome, args);
  if (error) throw new Error(`${nome}: ${error.message}`);
}

async function pagamento(id: string) {
  const p = await mp<{ id: number; status: string; external_reference?: string; transaction_amount: number; payment_type_id: string; date_approved?: string }>(
    `/v1/payments/${id}`,
  );
  if (p.status === "refunded" || p.status === "charged_back") return rpc("mp_estornar", { p_pagamento_id: String(p.id) });
  const ref = lerReferencia(p.external_reference);
  if (!ref || p.status !== "approved") return;
  await rpc("mp_registrar_compra", {
    p_empresa_id: ref.empresa,
    p_creditos: ref.creditos,
    p_pagamento_id: String(p.id),
    p_valor_centavos: Math.round(Number(p.transaction_amount) * 100),
    p_metodo: METODOS[p.payment_type_id] ?? null,
    p_pago_em: p.date_approved ?? null,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  if (!temToken()) return new Response("pagamento não configurado", { status: 503 });
  const url = new URL(req.url);
  const corpo = (await req.json().catch(() => ({}))) as { type?: string; topic?: string; data?: { id?: string | number } };
  const tipo = corpo.type ?? corpo.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !/^\d+$/.test(id)) return new Response("ok");

  try {
    await pagamento(id);
  } catch (e) {
    // 500 faz o Mercado Pago tentar de novo mais tarde.
    console.error(tipo, id, e);
    return new Response("erro", { status: 500 });
  }
  return new Response("ok");
});
