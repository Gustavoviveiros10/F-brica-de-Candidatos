import { exigirEmpresa } from "@/lib/conta";
import { data as fdata } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { ReguaCreditos } from "@/components/regua-creditos";
import { comprar } from "./actions";

export const metadata = { title: "Créditos · Fábrica de Candidatos" };

const MOTIVOS: Record<string, string> = {
  teste_gratis: "Contatos grátis do cadastro",
  compra: "Compra de créditos",
  ciclo: "Créditos do plano",
  liberacao: "Contato liberado",
  ajuste_admin: "Ajuste da equipe",
  expiracao: "Créditos expirados",
};

// Volta do Mercado Pago (?pagamento=) e erros da compra (?erro=).
const AVISOS: Record<string, { texto: string; warn?: boolean }> = {
  ok: { texto: "Pagamento aprovado! Os créditos entram em alguns segundos. Se ainda não apareceram, atualize a página." },
  pendente: { texto: "Pagamento em processamento. Pix costuma cair na hora; boleto leva até 2 dias úteis. Os créditos entram assim que o pagamento for aprovado." },
  falhou: { texto: "O pagamento não foi aprovado. Você pode tentar de novo com outra forma de pagamento.", warn: true },
};
const ERROS: Record<string, string> = {
  QUANTIDADE_INVALIDA: "Escolha entre 5 e 100 créditos.",
  EMPRESA_BLOQUEADA: "A conta da empresa está bloqueada. Fale com o suporte.",
  PAGAMENTO_NAO_CONFIGURADO: "O pagamento online ainda não está ligado. Fale com a gente para comprar créditos.",
};

type Movimento = { id: string; delta: number; motivo: string; justificativa: string | null; criado_em: string };

export default async function Creditos({ searchParams }: { searchParams: Promise<{ pagamento?: string; erro?: string }> }) {
  const { pagamento, erro } = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const [{ data: movimentos }, { data: validade }] = await Promise.all([
    supabase.from("creditos_movimentos").select("id,delta,motivo,justificativa,criado_em").order("criado_em", { ascending: false }).limit(30),
    supabase.from("empresas").select("creditos_validade").eq("id", empresa.id).maybeSingle<{ creditos_validade: string | null }>(),
  ]);
  const aviso = pagamento ? AVISOS[pagamento] : undefined;
  const vence = validade?.creditos_validade;

  return (
    <>
      <CabecalhoPagina titulo="Créditos" texto="1 crédito = 1 contato liberado. Pesquisar continua grátis." />
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
          <b>
            Você tem {empresa.saldo_creditos} {empresa.saldo_creditos === 1 ? "crédito" : "créditos"}.
          </b>{" "}
          {vence && empresa.saldo_creditos > 0 ? `Valem até ${fdata(vence)}. ` : ""}
          Compre mais quando precisar: quanto mais créditos, menor o preço de cada um.
        </span>
      </div>
      <div style={{ marginBottom: 28 }}>
        <ReguaCreditos inicial={25} acao={comprar} />
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
