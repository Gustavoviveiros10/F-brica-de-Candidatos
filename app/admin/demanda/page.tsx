import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { n } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Vazio } from "@/components/admin/blocos";

export const metadata = { title: "Demanda · Painel admin" };

type Demanda = {
  total: number;
  vazias: number;
  empresas: number;
  mais_buscadas: { descricao: string; n: number; vazias: number; empresas: number; media: number }[];
  sem_resultado: { descricao: string; n: number; empresas: number }[];
};

const PERIODOS = [7, 30, 90] as const;

function Barras({ itens, classe }: { itens: { descricao: string; n: number; extra: string }[]; classe?: string }) {
  const max = Math.max(1, ...itens.map((i) => i.n));
  return (
    <div className="bars">
      {itens.map((i, k) => (
        <div key={k} className="bar-row" title={i.extra}>
          <span className="name">{i.descricao}</span>
          <span className={`track ${classe ?? ""}`}>
            <i style={{ width: `${(i.n / max) * 100}%`, animationDelay: `${k * 50}ms` }} />
          </span>
          <span className="val">{n(i.n)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDemanda({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { dias: d } = await searchParams;
  const dias = PERIODOS.find((p) => String(p) === d) ?? 30;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_demanda", { p_dias: dias });
  if (error) throw new Error(error.message);
  const dm = data as Demanda;

  return (
    <>
      <CabecalhoPagina titulo="Demanda" texto="O que as empresas procuram na busca. As buscas sem resultado mostram onde captar candidatos." />
      <div className="adm-busca">
        <nav className="adm-chips" aria-label="Período">
          {PERIODOS.map((p) => (
            <Link key={p} href={`/admin/demanda?dias=${p}`} aria-current={dias === p ? "true" : undefined}>
              Últimos {p} dias
            </Link>
          ))}
        </nav>
      </div>
      <div className="kpis adm-kpis">
        <div className="kpi adm-kpi">
          <div className="l">Buscas</div>
          <div className="v num">{n(dm.total)}</div>
          <div className="s">nos últimos {dias} dias</div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Sem nenhum resultado</div>
          <div className="v num">{n(dm.vazias)}</div>
          <div className="s">{dm.total ? `${Math.round((dm.vazias / dm.total) * 100)}% das buscas` : "—"}</div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Empresas buscando</div>
          <div className="v num">{n(dm.empresas)}</div>
          <div className="s">fizeram pelo menos 1 busca</div>
        </div>
      </div>
      <div className="vg-duas adm-demanda">
        <div className="panel">
          <div className="panel-h">
            <h2>Mais buscadas</h2>
          </div>
          <div className="panel-b">
            {dm.mais_buscadas.length ? (
              <Barras itens={dm.mais_buscadas.map((b) => ({ descricao: b.descricao, n: b.n, extra: `${b.empresas} empresas · média de ${n(b.media)} resultados` }))} />
            ) : (
              <Vazio titulo="Nenhuma busca no período" />
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h2>Buscaram e não acharam</h2>
          </div>
          <div className="panel-b">
            {dm.sem_resultado.length ? (
              <Barras classe="vazia" itens={dm.sem_resultado.map((b) => ({ descricao: b.descricao, n: b.n, extra: `${b.empresas} empresas` }))} />
            ) : (
              <Vazio titulo="Toda busca achou alguém" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
