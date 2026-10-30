import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { data as fdata, reais } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { SITUACAO, comParametros, n, nomeMes, type ClienteLinha, type Financeiro } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Paginacao, Vazio } from "@/components/admin/blocos";

export const metadata = { title: "Financeiro · Painel admin" };

const POR_PAGINA = 50;
const FILTROS = [
  ["", "Pagantes"],
  ["atrasadas", "Renovação atrasada"],
  ["canceladas", "Cancelados"],
  ["todos", "Todos"],
] as const;

type Params = { filtro?: string; pagina?: string };

const linkEmpresa = (id: string) => `/admin/empresas?id=${id}`;
const diaMes = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });

// Financeiro "página própria": quanto entra, quem paga, plano de cada um e o que vence.
export default async function AdminFinanceiro({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const filtro = FILTROS.some(([v]) => v && v === p.filtro) ? p.filtro! : "";
  const pagina = Math.max(1, Number(p.pagina) || 1);
  const atuais = { filtro: filtro || undefined };

  const supabase = await supabaseServer();
  const [fin, cli] = await Promise.all([
    supabase.rpc("admin_financeiro"),
    supabase.rpc("admin_clientes", { p_filtro: filtro || null, p_limite: POR_PAGINA, p_offset: (pagina - 1) * POR_PAGINA }),
  ]);
  if (fin.error) throw new Error(fin.error.message);
  const f = fin.data as Financeiro;
  const clientes = (cli.data ?? []) as ClienteLinha[];
  const totalClientes = Number(clientes[0]?.total ?? 0);

  const mesAtual = f.meses[f.meses.length - 1]?.mes ?? "";
  const mesAntes = f.meses[f.meses.length - 2]?.mes ?? "";
  const variacao = f.receita_mes_antes > 0 ? Math.round(((f.receita_mes - f.receita_mes_antes) / f.receita_mes_antes) * 100) : null;
  const ticket = f.clientes ? Math.round(f.recorrente / f.clientes) : 0;
  const maxMes = Math.max(1, ...f.meses.map((m) => m.total));
  const maxPlano = Math.max(1, ...f.por_plano.map((x) => x.recorrente));

  return (
    <>
      <CabecalhoPagina titulo="Financeiro" texto="Quanto entra, quem paga e o que vence nos próximos dias." />
      <div className="fin-nota">
        <Icon name="check" />
        Números reais do banco. Como ainda não há pagamento online, cada venda entra aqui quando você registra o pagamento na ficha da empresa.
      </div>

      <div className="kpis adm-kpis">
        <div className="kpi adm-kpi">
          <div className="l">Entrou em {nomeMes(mesAtual, true)}</div>
          <div className="v num">{reais(f.receita_mes)}</div>
          <div className="s">
            {variacao === null ? (
              `${n(f.pagamentos_mes)} ${f.pagamentos_mes === 1 ? "pagamento" : "pagamentos"}`
            ) : (
              <>
                <span className={`adm-delta${variacao < 0 ? " neg" : ""}`}>
                  {variacao < 0 ? "▼" : "▲"} {Math.abs(variacao)}%
                </span>{" "}
                vs. {nomeMes(mesAntes, true)} ({reais(f.receita_mes_antes)})
              </>
            )}
          </div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Receita recorrente por mês</div>
          <div className="v num">{reais(f.recorrente)}</div>
          <div className="s">soma dos planos ativos</div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Clientes pagantes</div>
          <div className="v num">
            {n(f.clientes)}
            <small>de {n(f.empresas)} empresas</small>
          </div>
          <div className="s">
            {n(f.em_teste)} em teste grátis
            {f.atrasadas > 0 && ` · ${n(f.atrasadas)} ${f.atrasadas === 1 ? "renovação atrasada" : "renovações atrasadas"}`}
          </div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Ticket médio</div>
          <div className="v num">{reais(ticket)}</div>
          <div className="s">por cliente, por mês</div>
        </div>
      </div>

      <div className="fin-planos">
        {f.por_plano.map((pl) => (
          <div key={pl.id} className={`fin-plano${pl.destaque ? " dest" : ""}`}>
            <h3>{pl.nome}</h3>
            <div className="preco">{reais(pl.preco)} por mês</div>
            <div className="big num">
              {n(pl.clientes)}
              <small>{pl.clientes === 1 ? "cliente" : "clientes"}</small>
            </div>
            <div className="fin-plano-barra">
              <i style={{ width: `${(pl.recorrente / maxPlano) * 100}%` }} />
            </div>
            <div className="rodape">
              <span>
                Recorrente <b>{reais(pl.recorrente)}</b>
              </span>
              <span>{f.recorrente ? Math.round((pl.recorrente / f.recorrente) * 100) : 0}% da receita</span>
            </div>
          </div>
        ))}
      </div>

      <div className="vg-duas">
        <div className="panel">
          <div className="panel-h">
            <h2>Quanto entrou por mês</h2>
            <span className="small muted">últimos 6 meses</span>
          </div>
          <div className="panel-b">
            <div className="fin-meses" role="img" aria-label={f.meses.map((m) => `${nomeMes(m.mes, true)}: ${reais(m.total)}`).join(", ")}>
              {f.meses.map((m, i) => (
                <div key={m.mes} className={i === f.meses.length - 1 ? "atual" : undefined}>
                  <b>{m.total ? reais(m.total) : "–"}</b>
                  <i style={{ height: `${Math.max(2, (m.total / maxMes) * 120)}px`, animationDelay: `${i * 60}ms` }} />
                  {nomeMes(m.mes)}
                </div>
              ))}
            </div>
            <div className="fin-legenda">
              Soma dos pagamentos registrados em cada mês. {n(f.ja_pagaram)} de {n(f.empresas)} empresas já pagaram algum plano.
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h2>Renovações</h2>
            <span className="small muted">próximos 15 dias</span>
          </div>
          {f.renovacoes.length ? (
            <div className="panel-b">
              <div className="list adm-lista-anim">
                {f.renovacoes.map((r) => (
                  <Link key={r.empresa_id} href={linkEmpresa(r.empresa_id)}>
                    <span>
                      {r.empresa}
                      <br />
                      <span className="small muted">
                        {r.plano} · {reais(r.preco)}
                        {r.situacao === "atrasada" && ` · venceu ${diaMes(r.proxima)}`}
                      </span>
                    </span>
                    {r.situacao === "atrasada" ? <span className="chip chip-warn">Atrasada</span> : <b className="num">{diaMes(r.proxima)}</b>}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Vazio titulo="Nada vence nos próximos 15 dias" />
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h2>Clientes</h2>
          <nav className="adm-chips" aria-label="Filtrar clientes">
            {FILTROS.map(([v, rotulo]) => (
              <Link key={v} href={comParametros("/admin/financeiro", {}, { filtro: v || null })} aria-current={filtro === v ? "true" : undefined} scroll={false}>
                {rotulo}
              </Link>
            ))}
          </nav>
        </div>
        {clientes.length ? (
          <>
            <div className="table-wrap">
              <table className="t">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Plano</th>
                    <th className="n">Valor/mês</th>
                    <th>Cliente desde</th>
                    <th>Próxima renovação</th>
                    <th className="n">Total já pago</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => {
                    const s = SITUACAO[c.situacao] ?? { nome: c.situacao, classe: "" };
                    return (
                      <tr key={c.empresa_id} className="adm-linha">
                        <td>
                          <Link className="adm-link-linha" href={linkEmpresa(c.empresa_id)}>
                            <b>{c.empresa}</b>
                          </Link>
                          <span className="sub">{c.cidade ?? "Cidade não informada"}</span>
                        </td>
                        <td>{c.plano}</td>
                        <td className="n">{reais(c.preco_centavos)}</td>
                        <td>{c.desde ? fdata(c.desde) : "—"}</td>
                        <td>{c.situacao === "cancelada" || !c.proxima ? "—" : diaMes(c.proxima)}</td>
                        <td className="n">{reais(c.total_pago)}</td>
                        <td>
                          <span className={`chip ${s.classe}`}>{s.nome}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Paginacao pagina={pagina} total={totalClientes} porPagina={POR_PAGINA} href={(pg) => comParametros("/admin/financeiro", atuais, { pagina: pg > 1 ? String(pg) : null })} />
          </>
        ) : (
          <Vazio
            titulo={filtro ? "Ninguém nesse filtro" : "Nenhum cliente pagante ainda"}
            texto={filtro ? undefined : "Quando uma empresa pagar, abra a ficha dela em Empresas e use “Registrar pagamento e ativar”."}
          />
        )}
      </div>
    </>
  );
}
