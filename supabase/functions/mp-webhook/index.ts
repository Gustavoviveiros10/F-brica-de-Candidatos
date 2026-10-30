// Recebe os avisos do Mercado Pago e atualiza o banco (pagamentos, assinaturas e créditos).
// Pública (sem login): o Mercado Pago não manda token do Supabase. Por isso nunca confiamos no
// conteúdo do aviso: usamos só o id e buscamos o pagamento/assinatura na API do Mercado Pago
// com o nosso Access Token. Um aviso falso não consegue inventar pagamento, só faz a gente reler
// um que já existe na nossa conta. Avisos repetidos não duplicam nada (gateway_pagamento_id é único).
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
const centavos = (v: number) => Math.round(Number(v) * 100);

async function rpc(nome: string, args: Record<string, unknown>) {
  const { error } = await banco.rpc(nome, args);
  if (error) throw new Error(`${nome}: ${error.message}`);
}

// Pagamento avulso (Pix, boleto, cartão) e estornos de qualquer pagamento.
async function pagamento(id: string) {
  const p = await mp<{ id: number; status: string; external_reference?: string; transaction_amount: number; payment_type_id: string; date_approved?: string }>(
    `/v1/payments/${id}`,
  );
  if (p.status === "refunded" || p.status === "charged_back") return rpc("mp_estornar", { p_pagamento_id: String(p.id) });
  const ref = lerReferencia(p.external_reference);
  // Cobranças da assinatura automática entram pelo aviso subscription_authorized_payment.
  if (!ref || ref.tipo !== "mes" || p.status !== "approved") return;
  await rpc("mp_registrar_pagamento", {
    p_empresa_id: ref.empresa,
    p_plano_id: ref.plano,
    p_pagamento_id: String(p.id),
    p_assinatura_id: null,
    p_valor_centavos: centavos(p.transaction_amount),
    p_metodo: METODOS[p.payment_type_id] ?? null,
    p_pago_em: p.date_approved ?? null,
  });
}

type Preapproval = { id: string; status: string; external_reference?: string; next_payment_date?: string };

// Cada cobrança mensal da assinatura automática.
async function cobrancaAssinatura(id: string) {
  const a = await mp<{ preapproval_id: string; transaction_amount: number; payment?: { id: number; status: string }; debit_date?: string }>(
    `/authorized_payments/${id}`,
  );
  if (!a.payment || a.payment.status !== "approved") return;
  const pre = await mp<Preapproval>(`/preapproval/${a.preapproval_id}`);
  const ref = lerReferencia(pre.external_reference);
  if (!ref || ref.tipo !== "ass") return;
  await rpc("mp_registrar_pagamento", {
    p_empresa_id: ref.empresa,
    p_plano_id: ref.plano,
    p_pagamento_id: String(a.payment.id),
    p_assinatura_id: pre.id,
    p_valor_centavos: centavos(a.transaction_amount),
    p_metodo: "cartao",
    p_pago_em: a.debit_date ?? null,
    p_proxima: pre.next_payment_date ?? null,
  });
}

// Assinatura autorizada, pausada ou cancelada.
async function assinatura(id: string) {
  const pre = await mp<Preapproval>(`/preapproval/${id}`);
  const ref = lerReferencia(pre.external_reference);
  if (!ref || ref.tipo !== "ass") return;
  await rpc("mp_atualizar_assinatura", {
    p_empresa_id: ref.empresa,
    p_plano_id: ref.plano,
    p_assinatura_id: pre.id,
    p_status_mp: pre.status,
    p_proxima: pre.next_payment_date ?? null,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  if (!temToken()) return new Response("pagamento não configurado", { status: 503 });
  const url = new URL(req.url);
  const corpo = (await req.json().catch(() => ({}))) as { type?: string; topic?: string; data?: { id?: string | number } };
  const tipo = corpo.type ?? corpo.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (!tipo || !/^[\w-]+$/.test(id)) return new Response("ok");

  try {
    if (tipo === "payment") await pagamento(id);
    else if (tipo === "subscription_authorized_payment") await cobrancaAssinatura(id);
    else if (tipo === "subscription_preapproval") await assinatura(id);
  } catch (e) {
    // 500 faz o Mercado Pago tentar de novo mais tarde.
    console.error(tipo, id, e);
    return new Response("erro", { status: 500 });
  }
  return new Response("ok");
});
