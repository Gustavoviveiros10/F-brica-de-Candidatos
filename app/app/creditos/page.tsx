import { exigirEmpresa } from "@/lib/conta";
import { data as fdata, reais } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";

export const metadata = { title: "Plano e créditos · Fábrica de Candidatos" };

const MOTIVOS: Record<string, string> = {
  teste_gratis: "Contatos grátis do teste",
  ciclo: "Créditos do plano",
  liberacao: "Contato liberado",
  ajuste_admin: "Ajuste da equipe",
  expiracao: "Créditos expirados",
};

type Plano = { id: number; nome: string; preco_centavos: number; creditos: number; descricao: string | null; destaque: boolean };
type Movimento = { id: string; delta: number; motivo: string; justificativa: string | null; criado_em: string };

export default async function Creditos() {
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const [{ data: planos }, { data: movimentos }] = await Promise.all([
    supabase.from("planos").select("id,nome,preco_centavos,creditos,descricao,destaque").eq("ativo", true).order("ordem"),
    supabase.from("creditos_movimentos").select("id,delta,motivo,justificativa,criado_em").order("criado_em", { ascending: false }).limit(30),
  ]);

  return (
    <>
      <CabecalhoPagina titulo="Plano e créditos" texto="1 crédito = 1 contato liberado. Pesquisar continua grátis." />
      <div className="banner">
        <span>
          <b>Você tem {empresa.saldo_creditos} {empresa.saldo_creditos === 1 ? "crédito" : "créditos"}.</b> O pagamento online está chegando. Por enquanto, os
          créditos dos planos são liberados pela nossa equipe.
        </span>
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
            <button className={`btn btn-block ${p.destaque ? "btn-on-deep" : "btn-secondary"}`} disabled>
              Pagamento online em breve
            </button>
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
