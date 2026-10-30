// Chamadas à API do Mercado Pago. O Access Token fica só nos segredos das Edge Functions do Supabase
// (MP_ACCESS_TOKEN), nunca no repositório nem no navegador.

const API = "https://api.mercadopago.com";

export const temToken = () => Boolean(Deno.env.get("MP_ACCESS_TOKEN"));

export async function mp<T = Record<string, unknown>>(caminho: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const r = await fetch(API + caminho, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
      ...(init.method && init.method !== "GET" ? { "X-Idempotency-Key": crypto.randomUUID() } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Mercado Pago ${init.method ?? "GET"} ${caminho} -> ${r.status}: ${texto.slice(0, 500)}`);
  return (texto ? JSON.parse(texto) : {}) as T;
}

// external_reference que a gente manda pro Mercado Pago: "<tipo>:<empresa_id>:<plano_id>".
// tipo "ass" = assinatura automática no cartão; "mes" = pagamento de 1 mês (Pix, boleto ou cartão).
export type Referencia = { tipo: "ass" | "mes"; empresa: string; plano: string };

export const montarReferencia = (r: Referencia) => `${r.tipo}:${r.empresa}:${r.plano}`;

export function lerReferencia(v: unknown): Referencia | null {
  const m = /^(ass|mes):([0-9a-f-]{36}):([a-z0-9_-]+)$/.exec(String(v ?? ""));
  return m ? { tipo: m[1] as Referencia["tipo"], empresa: m[2], plano: m[3] } : null;
}

export const json = (dados: unknown, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } });
