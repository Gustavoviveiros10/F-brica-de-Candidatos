import { exigirEmpresa } from "@/lib/conta";
import { data as fdata, reais } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { BotaoEnviar } from "@/components/botao-enviar";
import { cancelarAssinatura, pagar } from "./actions";

export const metadata = { title: "Plano e créditos · Fábrica de Candidatos" };

const MOTIVOS: Record<string, string> = {
  teste_gratis: "Contatos grátis do teste",
  ciclo: "Créditos do plano",
  liberacao: "Contato liberado",
  ajuste_admin: "Ajuste da equipe",
  expiracao: "Créditos expirados",
};

// Volta do Mercado Pago (?pagamento=) e erros das ações (?erro=).
const AVISOS: Record<string, { texto: string; warn?: boolean }> = {
  ok: { texto: "Pagamento aprovado! Os créditos entram em alguns segundos. Se ainda não apareceram, atualize a página." },
  assinatura: { texto: "Assinatura recebida! Assim que o Mercado Pago aprovar a primeira cobrança, os créditos entram aqui." },
  pendente: { texto: "Pagamento em processamento. Pix costuma cair na hora; boleto leva até 2 dias úteis. Os créditos entram quando o pagamento for aprovado." },
  falhou: { texto: "O pagamento não foi aprovado. Você pode tentar de novo com outra forma de pagamento.", warn: true },
  cancelado: { texto: "Assinatura cancelada. Não haverá novas cobranças, e os créditos que sobraram continuam com você." },
};
const ERROS: Record<string, string> = {
  JA_TEM_ASSINATURA: "Você já tem uma assinatura ativa. Para trocar de plano, cancele a atual primeiro.",
  PLANO_INVALIDO: "Esse plano não está disponível.",
  EMPRESA_BLOQUEADA: "A conta da empresa está bloqueada. Fale com o suporte.",
  PAGAMENTO_NAO_CONFIGURADO: "O pagamento online ainda não está ligado. Fale com a gente para ativar seu plano.",
  SEM_ASSINATURA: "Não encontramos assinatura ativa para cancelar.",
};

type Plano = { id: string; nome: string; preco_centavos: number; creditos: number; descricao: string | null; destaque: boolean };
type Assinatura = { plano_id: string; status: string; gateway: string | null; gateway_assinatura_id: string | null; proxima_cobranca: string | null };
type Movimento = { id: string; delta: number; motivo: string; justificativa: string | null; criado_em: string };

export default async function Creditos({ searchParams }: { searchParams: Promise<{ pagamento?: string; erro?: string }> }) {
  const { pagamento, erro } = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const [{ data: planos }, { data: movimentos }, { data: assinaturas }] = await Promise.all([
    supabase.from("planos").select("id,nome,preco_centavos,creditos,descricao,destaque").eq("ativo", true).order("ordem"),
    supabase.from("creditos_movimentos").select("id,delta,motivo,justificativa,criado_em").order("criado_em", { ascending: false }).limit(30),
    supabase
      .from("assinaturas")
      .select("plano_id,status,gateway,gateway_assinatura_id,proxima_cobranca")
      .in("status", ["ativa", "atrasada"])
      .order("criado_em", { ascending: false })
      .limit(1),
  ]);
  const vigente = (assinaturas?.[0] ?? null) as Assinatura | null;
  // Assinatura no cartão: o Mercado Pago cobra sozinho; para trocar de plano, cancela antes.
  const automatica = vigente?.gateway === "mercadopago" && Boolean(vigente.gateway_assinatura_id);
  const aviso = pagamento ? AVISOS[pagamento] : undefined;

  return (
    <>
      <CabecalhoPagina titulo="Plano e créditos" texto="1 crédito = 1 contato liberado. Pesquisar continua grátis." />
      {aviso && (
        <div className={`banner${aviso.warn ? " warn" : ""}`}>
          <span>{aviso.texto}</span>
        </div>
      )}
      {erro && (
        <div className="banner warn">
          <span>{ERROS[erro] ?? "Não conseguimos abrir o Mercado Pago agora. Tente de novo em instantes."}</span>
        </div>
      )}
      <div className="banner">
        <span>
          <b>Você tem {empresa.saldo_creditos} {empresa.saldo_creditos === 1 ? "crédito" : "créditos"}.</b>{" "}
          {vigente
            ? `Plano ${((planos ?? []) as Plano[]).find((p) => p.id === vigente.plano_id)?.nome ?? vigente.plano_id}${
                vigente.proxima_cobranca ? `, ${automatica ? "próxima cobrança" : "vale até"} ${fdata(vigente.proxima_cobranca)}` : ""
              }.`
            : "Escolha um plano: no cartão a renovação é automática, ou pague 1 mês por vez com Pix ou boleto."}
        </span>
        {automatica && (
          <form action={cancelarAssinatura}>
            <BotaoEnviar className="btn btn-ghost" enviando="Cancelando...">
              Cancelar assinatura
            </BotaoEnviar>
          </form>
        )}
      </div>
      <div className="plans" style={{ marginBottom: 28 }}>
        {((planos ?? []) as Plano[]).map((p) => (
          <article key={p.id} className={`plan${p.destaque ? " featured" : ""}`}>
            {p.destaque && <span className="tagline">Mais escolhido</span>}
            <h3>{p.nome}</h3>
            {p.descricao && <p className="per">{p.descricao}</p>}
            <div className="price">
              {reais(p.preco_centavos)}
              <small>/mês</small>
            </div>
            <ul>
              <li>
                <Icon name="check" />
                {p.creditos} contatos por mês
              </li>
              <li>
                <Icon name="check" />
                {reais(Math.round(p.preco_centavos / p.creditos))} por contato
              </li>
            </ul>
            {automatica ? (
              <button className="btn btn-block btn-secondary" disabled>
                {vigente?.plano_id === p.id ? "Seu plano atual" : "Cancele o plano atual para trocar"}
              </button>
            ) : (
              <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
                <form action={pagar}>
                  <input type="hidden" name="plano" value={p.id} />
                  <input type="hidden" name="acao" value="assinar" />
                  <BotaoEnviar className={`btn btn-block ${p.destaque ? "btn-on-deep" : "btn-primary"}`} enviando="Abrindo Mercado Pago...">
                    Assinar no cartão
                  </BotaoEnviar>
                </form>
                <form action={pagar}>
                  <input type="hidden" name="plano" value={p.id} />
                  <input type="hidden" name="acao" value="mes" />
                  <BotaoEnviar className="btn btn-block btn-secondary" enviando="Abrindo Mercado Pago...">
                    Pagar 1 mês com Pix ou boleto
                  </BotaoEnviar>
                </form>
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="panel">
        <div className="panel-h">
          <h2>Extrato</h2>
        </div>
        {movimentos?.length ? (
          <div className="panel-b">
            <div className="list">
              {(movimentos as Movimento[]).map((m) => (
                <div key={m.id}>
                  <span>
                    {MOTIVOS[m.motivo] ?? m.motivo}
                    {m.justificativa && <span className="small muted"> · {m.justificativa}</span>}
                    <br />
                    <span className="small muted">{fdata(m.criado_em)}</span>
                  </span>
                  <b className="num" style={{ color: m.delta > 0 ? "var(--ok)" : "var(--ink)" }}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </b>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty">
            <b>Sem movimentos ainda</b>
          </div>
        )}
      </div>
    </>
  );
}
