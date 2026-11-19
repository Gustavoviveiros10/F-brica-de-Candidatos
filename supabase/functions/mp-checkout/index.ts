// Abre o pagamento de créditos avulsos no Mercado Pago para a empresa de quem está logado.
// Chamada pelo site (server action em app/app/creditos/actions.ts) com o login do usuário.
// Corpo: { acao: "comprar", quantidade: number (5 a 100) }
// Resposta: { url } para mandar a pessoa ao Checkout Pro (Pix, boleto ou cartão).
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, montarReferencia, mp, temToken } from "../_shared/mp.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SITE = Deno.env.get("SITE_URL") ?? "https://www.fabricadecandidatos.com.br";

type Conta = { user_id: string | null; empresa: { id: string; status: string } | null };

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ erro: "METODO" }, 405);
  if (!temToken()) return json({ erro: "PAGAMENTO_NAO_CONFIGURADO" }, 503);

  // Quem está pedindo: usa o login da própria pessoa, então as regras do banco valem.
  const usuario = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: u } = await usuario.auth.getUser();
  if (!u.user?.email) return json({ erro: "NAO_AUTENTICADO" }, 401);
  const { data: conta } = await usuario.rpc("minha_conta");
  const empresa = (conta as Conta | null)?.empresa;
  if (!empresa) return json({ erro: "SEM_EMPRESA" }, 400);
  if (empresa.status === "bloqueada") return json({ erro: "EMPRESA_BLOQUEADA" }, 403);

  const { acao, quantidade } = (await req.json().catch(() => ({}))) as { acao?: string; quantidade?: number };
  if (acao !== "comprar") return json({ erro: "ACAO_INVALIDA" }, 400);
  const qtd = Math.round(Number(quantidade));

  // Preço calculado pelo banco (tabela faixas_preco); recusa quantidade fora da régua.
  const { data: total, error } = await usuario.rpc("preco_creditos", { p_quantidade: qtd });
  if (error || !total) return json({ erro: "QUANTIDADE_INVALIDA" }, 400);

  try {
    const voltar = `${SITE}/app/creditos`;
    const pref = await mp<{ init_point: string }>("/checkout/preferences", {
      method: "POST",
      body: {
        items: [{ id: `creditos-${qtd}`, title: `Fábrica de Candidatos · ${qtd} créditos (contatos)`, quantity: 1, unit_price: Number(total) / 100, currency_id: "BRL" }],
        external_reference: montarReferencia({ empresa: empresa.id, creditos: qtd }),
        payer: { email: u.user.email },
        back_urls: { success: `${voltar}?pagamento=ok`, pending: `${voltar}?pagamento=pendente`, failure: `${voltar}?pagamento=falhou` },
        auto_return: "approved",
        notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
        statement_descriptor: "FABRICA CANDIDATOS",
        payment_methods: { installments: 1 },
      },
    });
    return json({ url: pref.init_point });
  } catch (e) {
    console.error(e);
    return json({ erro: "MERCADO_PAGO_FALHOU" }, 502);
  }
});
