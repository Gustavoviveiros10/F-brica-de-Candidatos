import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { data as fdata } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";

export const metadata = { title: "Visão geral · Fábrica de Candidatos" };

type Liberado = { liberacao_id: string; nome: string; funcao: string; cidade: string; uf: string; etapa: string; liberado_em: string; total: number };

export default async function VisaoGeral({ searchParams }: { searchParams: Promise<{ bemvindo?: string }> }) {
  const { bemvindo } = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("meus_contatos_liberados", { p_limite: 4, p_offset: 0 });
  const ultimos = (data ?? []) as Liberado[];
  const totalLiberados = ultimos[0]?.total ?? 0;
  const teste = empresa.status === "teste";

  return (
    <>
      <CabecalhoPagina
        titulo={`Olá, ${empresa.usuario_nome.split(" ")[0]}`}
        texto={bemvindo ? "Conta criada. Você tem 2 contatos grátis para testar." : "Resumo da sua conta."}
        direita={
          <Link className="btn btn-primary" href="/app/busca">
            <Icon name="search" /> Buscar candidatos
          </Link>
        }
      />
      {teste ? (
        <div className="banner">
          <span>
            <b>Teste grátis:</b> {empresa.saldo_creditos} de 2 contatos disponíveis. Escolha um plano para continuar liberando.
          </span>
          <Link className="btn btn-sm btn-primary" href="/app/creditos">Ver planos</Link>
        </div>
      ) : empresa.saldo_creditos <= 1 ? (
        <div className="banner warn">
          <span>
            <b>Poucos créditos.</b> Resta {empresa.saldo_creditos}. Mude de plano antes de acabar.
          </span>
          <Link className="btn btn-sm btn-primary" href="/app/creditos">Ver planos</Link>
        </div>
      ) : null}
      <div className="kpis">
        <div className="kpi">
          <div className="l">Créditos disponíveis</div>
          <div className="v num">{empresa.saldo_creditos}</div>
          <div className="s">{teste ? "Teste grátis" : "Do seu plano"}</div>
        </div>
        <div className="kpi">
          <div className="l">Contatos liberados</div>
          <div className="v num">{totalLiberados}</div>
          <div className="s">1 crédito cada, uma vez só</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-h">
          <h2>Últimos contatos liberados</h2>
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
                  <Link className="btn btn-secondary btn-sm" href="/app/liberados">Ver</Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty">
            <b>Nada liberado ainda</b>Use um dos seus créditos no candidato que mais combina com a vaga.
            <br />
            <Link className="btn btn-primary" href="/app/busca">Buscar candidatos</Link>
          </div>
        )}
      </div>
    </>
  );
}
