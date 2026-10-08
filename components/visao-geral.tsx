import Link from "next/link";
import { ETAPAS, NOME_ETAPA } from "@/lib/etapas";
import { CATEGORIAS, data as fdata } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";

// Dados devolvidos por painel_resumo() no banco.
export type Resumo = {
  cidade: { id: number; nome: string; uf: string } | null;
  regiao: { total: number; quentes: number; imediatos: number; novos_7d: number; por_categoria: Record<string, number> };
  funil: Record<string, number>;
  parados: number;
  salvos: number;
  creditos_mes: number;
  buscas: { filtros: Record<string, string>; total: number; em: string; funcao: string | null; cidade: string | null }[];
};

export type UltimoLiberado = { liberacao_id: string; nome: string; funcao: string; cidade: string; uf: string; etapa: string; liberado_em: string };

export type DadosVisaoGeral = {
  nome: string;
  saldo: number;
  teste: boolean;
  bemvindo: boolean;
  resumo: Resumo;
  ultimos: UltimoLiberado[];
};

const EM_PROCESSO = ["contatado", "conversando", "entrevista", "aprovado"];
const n = (v: number) => v.toLocaleString("pt-BR");
const soma = (f: Record<string, number>, etapas: string[]) => etapas.reduce((t, e) => t + (f[e] ?? 0), 0);
const totalFunil = (f: Record<string, number>) => Object.values(f).reduce((a, b) => a + b, 0);

function linkBusca(filtros: Record<string, string>) {
  const q = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== "" && v != null));
  if (!("cidade" in filtros)) q.set("cidade", "");
  return `/app/busca?${q}`;
}

// ---------- Blocos ----------

export function AvisoCreditos({ saldo, teste }: { saldo: number; teste: boolean }) {
  if (teste)
    return (
      <div className="banner">
        <span>
          <b>Teste grátis:</b> {saldo} de 2 contatos disponíveis. Escolha um plano para continuar liberando.
        </span>
        <Link className="btn btn-sm btn-primary" href="/app/creditos">Ver planos</Link>
      </div>
    );
  if (saldo <= 1)
    return (
      <div className="banner warn">
        <span>
          <b>Poucos créditos.</b> Resta {saldo}. Mude de plano antes de acabar.
        </span>
        <Link className="btn btn-sm btn-primary" href="/app/creditos">Ver planos</Link>
      </div>
    );
  return null;
}

export function Indicadores({ d }: { d: DadosVisaoGeral }) {
  const f = d.resumo.funil;
  return (
    <div className="kpis">
      <Link className="kpi vg-kpi" href="/app/creditos">
        <div className="l">Créditos disponíveis</div>
        <div className="v num">{d.saldo}</div>
        <div className="s">{d.teste ? "Teste grátis" : `${d.resumo.creditos_mes} usados este mês`}</div>
      </Link>
      <Link className="kpi vg-kpi" href="/app/liberados">
        <div className="l">Contatos liberados</div>
        <div className="v num">{totalFunil(f)}</div>
        <div className="s">{f.novo ? `${f.novo} ainda sem contato` : "Todos já em andamento"}</div>
      </Link>
      <Link className="kpi vg-kpi" href="/app/liberados">
        <div className="l">Em processo</div>
        <div className="v num">{soma(f, EM_PROCESSO)}</div>
        <div className="s">{f.entrevista ? `${f.entrevista} em entrevista` : "Contatado até aprovado"}</div>
      </Link>
      <Link className="kpi vg-kpi" href="/app/liberados?etapa=contratado">
        <div className="l">Contratados</div>
        <div className="v num" style={{ color: "var(--e-contratado)" }}>{f.contratado ?? 0}</div>
        <div className="s">Pela Fábrica</div>
      </Link>
    </div>
  );
}

export function Funil({ funil, parados }: { funil: Record<string, number>; parados: number }) {
  const total = totalFunil(funil);
  return (
    <div className="panel">
      <div className="panel-h">
        <h2>Seu funil</h2>
        <Link className="linklike small" href="/app/liberados">Abrir CRM</Link>
      </div>
      <div className="panel-b">
        {total ? (
          <>
            <div className="vg-barra" role="img" aria-label="Distribuição dos contatos por etapa">
              {ETAPAS.filter((e) => funil[e.id]).map((e) => (
                <span key={e.id} className={`etapa-${e.id}`} style={{ flexGrow: funil[e.id] }} title={`${e.nome}: ${funil[e.id]}`} />
              ))}
            </div>
            <div className="vg-etapas">
              {ETAPAS.map((e) => (
                <Link key={e.id} href={`/app/liberados?etapa=${e.id}`} className={`etapa-${e.id}${funil[e.id] ? "" : " vazio"}`}>
                  <span className="etapa-chip">{e.nome}</span>
                  <b className="num">{funil[e.id] ?? 0}</b>
                </Link>
              ))}
            </div>
            {parados > 0 && (
              <Link className="vg-alerta" href="/app/liberados?etapa=novo">
                <Icon name="alert" />
                <span>
                  <b>{parados} {parados === 1 ? "contato parado" : "contatos parados"}</b> em Novo há mais de 3 dias. Chame antes que outra empresa chame.
                </span>
              </Link>
            )}
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Quando você liberar um contato, ele aparece aqui com a etapa do processo.
          </p>
        )}
      </div>
    </div>
  );
}

export function Regiao({ resumo }: { resumo: Resumo }) {
  const { regiao, cidade } = resumo;
  const cats = Object.entries(regiao.por_categoria).sort((a, b) => b[1] - a[1]);
  return (
    <div className="panel">
      <div className="panel-h">
        <h2>{cidade ? `Perto de ${cidade.nome}` : "Candidatos na base"}</h2>
        {cidade && <span className="small muted">até 30 km</span>}
      </div>
      <div className="panel-b">
        {cidade && regiao.total ? (
          <>
            <p className="vg-regiao-resumo">
              <b className="num">{n(regiao.total)}</b> candidatos disponíveis
              {regiao.quentes > 0 && (
                <>
                  {" · "}
                  <span className="chip t-hot"><Icon name="flame" />{n(regiao.quentes)} quentes</span>
                </>
              )}
            </p>
            <div className="vg-areas">
              {cats.map(([k, total]) => {
                const c = CATEGORIAS[k] ?? CATEGORIAS.outros;
                return (
                  <Link key={k} className="vg-area" href={`/app/busca?funcao=cat:${k}&cidade=${cidade.id}`}>
                    <span>
                      <b>{c.nome}</b>
                      <small>{n(total)} candidatos</small>
                    </span>
                    <Icon name="arrow" />
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Ainda não temos candidatos perto da sua cidade. <Link className="linklike" href="/app/busca?cidade=">Buscar no Brasil todo</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export function Ultimos({ ultimos }: { ultimos: UltimoLiberado[] }) {
  return (
    <div className="panel">
      <div className="panel-h">
        <h2>Últimos liberados</h2>
        {ultimos.length > 0 && <Link className="linklike small" href="/app/liberados">Ver todos</Link>}
      </div>
      {ultimos.length ? (
        <div className="panel-b">
          <div className="list">
            {ultimos.map((c) => (
              <div key={c.liberacao_id}>
                <span>
                  <b>{c.nome}</b>
                  <br />
                  <span className="small muted">
                    {c.funcao} · {c.cidade}/{c.uf} · {fdata(c.liberado_em)}
                  </span>
                </span>
                <span className={`etapa-chip etapa-${c.etapa}`}>{NOME_ETAPA[c.etapa] ?? c.etapa}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty">
          <b>Nada liberado ainda</b>Use um crédito no candidato que mais combina com a vaga.
        </div>
      )}
    </div>
  );
}

export function BuscasRecentes({ buscas }: { buscas: Resumo["buscas"] }) {
  if (!buscas.length) return null;
  return (
    <div className="panel">
      <div className="panel-h">
        <h2>Buscas recentes</h2>
      </div>
      <div className="panel-b">
        <div className="list">
          {buscas.map((b, i) => (
            <div key={i}>
              <span>
                <b>{b.funcao ? (CATEGORIAS[b.funcao]?.nome ?? b.funcao) : "Todas as funções"}</b>
                <br />
                <span className="small muted">
                  {b.cidade ?? "Brasil todo"} · {n(b.total)} resultados · {fdata(b.em)}
                </span>
              </span>
              <Link className="btn btn-secondary btn-sm" href={linkBusca(b.filtros)}>
                <Icon name="history" /> Repetir
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cabecalho({ d }: { d: DadosVisaoGeral }) {
  return (
    <div className="page-head">
      <div>
        <h1>Olá, {d.nome}</h1>
        <p>{d.bemvindo ? "Conta criada. Você tem 2 contatos grátis para testar." : "Veja como estão suas contratações."}</p>
      </div>
      <Link className="btn btn-primary" href="/app/busca">
        <Icon name="search" /> Buscar candidatos
      </Link>
    </div>
  );
}

// Visão geral: números, funil e região lado a lado (opção A escolhida em 2026-10-08).
export function VisaoGeral({ d }: { d: DadosVisaoGeral }) {
  return (
    <>
      <Cabecalho d={d} />
      <AvisoCreditos saldo={d.saldo} teste={d.teste} />
      <Indicadores d={d} />
      <div className="vg-duas">
        <Funil funil={d.resumo.funil} parados={d.resumo.parados} />
        <Regiao resumo={d.resumo} />
      </div>
      <div className="vg-duas">
        <Ultimos ultimos={d.ultimos} />
        <BuscasRecentes buscas={d.resumo.buscas} />
      </div>
    </>
  );
}
