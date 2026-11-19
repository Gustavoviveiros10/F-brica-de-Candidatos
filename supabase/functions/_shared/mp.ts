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

// external_reference que a gente manda pro Mercado Pago: "cred:<empresa_id>:<quantidade>".
export type Referencia = { empresa: string; creditos: number };

export const montarReferencia = (r: Referencia) => `cred:${r.empresa}:${r.creditos}`;

export function lerReferencia(v: unknown): Referencia | null {
  const m = /^cred:([0-9a-f-]{36}):(\d{1,4})$/.exec(String(v ?? ""));
  return m ? { empresa: m[1], creditos: Number(m[2]) } : null;
}

export const json = (dados: unknown, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } });
