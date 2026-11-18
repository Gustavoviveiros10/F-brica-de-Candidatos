// Abre o pagamento no Mercado Pago para a empresa de quem está logado, ou cancela a assinatura.
// Chamada pelo site (server action em app/app/creditos/actions.ts) com o login do usuário.
// Corpo: { acao: "assinar" | "mes" | "cancelar", plano?: string }
// Resposta: { url } para mandar a pessoa ao Mercado Pago, ou { ok: true } no cancelamento.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, montarReferencia, mp, temToken } from "../_shared/mp.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SITE = Deno.env.get("SITE_URL") ?? "https://www.fabricadecandidatos.com.br";

type Conta = { user_id: string | null; empresa: { id: string; status: string } | null };
type Plano = { id: string; nome: string; preco_centavos: number; creditos: number };

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

  const banco = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { acao, plano: planoId } = (await req.json().catch(() => ({}))) as { acao?: string; plano?: string };

  // Assinatura automática que está valendo (só pode ter uma).
  const { data: vigentes } = await banco
    .from("assinaturas")
    .select("id,gateway_assinatura_id,plano_id")
    .eq("empresa_id", empresa.id)
    .eq("gateway", "mercadopago")
    .not("gateway_assinatura_id", "is", null)
    .in("status", ["ativa", "atrasada"])
    .order("criado_em", { ascending: false })
    .limit(1);
  const vigente = vigentes?.[0];

  try {
    if (acao === "cancelar") {
      if (!vigente) return json({ erro: "SEM_ASSINATURA" }, 400);
      const pre = await mp<{ status: string; next_payment_date?: string }>(`/preapproval/${vigente.gateway_assinatura_id}`, {
        method: "PUT",
        body: { status: "cancelled" },
      });
      const { error } = await banco.rpc("mp_atualizar_assinatura", {
        p_empresa_id: empresa.id,
        p_plano_id: vigente.plano_id,
        p_assinatura_id: vigente.gateway_assinatura_id,
        p_status_mp: pre.status ?? "cancelled",
        p_proxima: null,
      });
      if (error) throw error;
      return json({ ok: true });
    }

    if (acao !== "assinar" && acao !== "mes") return json({ erro: "ACAO_INVALIDA" }, 400);
    if (vigente) return json({ erro: "JA_TEM_ASSINATURA" }, 409);
    const { data: plano } = await banco
      .from("planos")
      .select("id,nome,preco_centavos,creditos")
      .eq("id", planoId ?? "")
      .eq("ativo", true)
      .maybeSingle<Plano>();
    if (!plano) return json({ erro: "PLANO_INVALIDO" }, 400);
    const valor = plano.preco_centavos / 100;
    const voltar = `${SITE}/app/creditos`;

    if (acao === "assinar") {
      // Assinatura sem plano associado, status "pending": a pessoa cadastra o cartão na tela do Mercado Pago.
      const pre = await mp<{ init_point: string }>("/preapproval", {
        method: "POST",
        body: {
          reason: `Fábrica de Candidatos · Plano ${plano.nome} (${plano.creditos} contatos/mês)`,
          external_reference: montarReferencia({ tipo: "ass", empresa: empresa.id, plano: plano.id }),
          payer_email: u.user.email,
          auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: valor, currency_id: "BRL" },
          back_url: `${voltar}?pagamento=assinatura`,
          status: "pending",
        },
      });
      return json({ url: pre.init_point });
    }

    // Pagamento de 1 mês pelo Checkout Pro: Pix, boleto ou cartão.
    const pref = await mp<{ init_point: string }>("/checkout/preferences", {
      method: "POST",
      body: {
        items: [{ id: plano.id, title: `Plano ${plano.nome} · 1 mês (${plano.creditos} contatos)`, quantity: 1, unit_price: valor, currency_id: "BRL" }],
        external_reference: montarReferencia({ tipo: "mes", empresa: empresa.id, plano: plano.id }),
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
