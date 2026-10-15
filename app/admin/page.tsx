import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { MOTIVOS, n, quando, type EmpresaLinha, type ResumoAdmin } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { GraficoDias, KpisAdmin, TabelaEmpresas, Vazio } from "@/components/admin/blocos";
import { ListaLiberacoes, type LiberacaoAdmin } from "@/components/admin/lista-liberacoes";

type Movimento = { id: number; criado_em: string; empresa_id: string; empresa: string; delta: number; motivo: string; justificativa: string | null };

const linkEmpresa = (id: string) => `/admin/empresas?id=${id}`;

// Visão geral "Torre de controle": números do mês, gráfico, créditos, empresas e últimas liberações.
export default async function AdminVisaoGeral() {
  const supabase = await supabaseServer();
  const [resumo, creditos, empresas, liberacoes] = await Promise.all([
    supabase.rpc("admin_resumo"),
    supabase.rpc("admin_creditos", { p_limite: 30 }),
    supabase.rpc("admin_empresas", { p_limite: 8 }),
    supabase.rpc("admin_liberacoes", { p_limite: 6 }),
  ]);
  if (resumo.error) throw new Error(resumo.error.message);
  const r = resumo.data as ResumoAdmin;
  // Liberações já têm painel próprio; aqui ficam entradas de crédito e ajustes.
  const movimentos = ((creditos.data ?? []) as Movimento[]).filter((m) => m.motivo !== "liberacao").slice(0, 5);
  const listaEmpresas = (empresas.data ?? []) as EmpresaLinha[];
  const totalEmpresas = Number(listaEmpresas[0]?.total ?? 0);

  return (
    <>
      <CabecalhoPagina
        titulo="Visão geral"
        texto={`Tudo o que está acontecendo na Fábrica, numa tela só. ${n(r.candidatos_ativos)} candidatos ativos na base.`}
      />
      <KpisAdmin r={r} />
      <div className="vg-duas">
        <GraficoDias dias={r.dias} />
        <div className="panel">
          <div className="panel-h">
            <h2>Créditos</h2>
            <Link className="small" href="/admin/creditos">
              Extrato completo
            </Link>
          </div>
          {movimentos.length ? (
            <div className="panel-b">
              <div className="list adm-lista-anim">
                {movimentos.map((m) => (
                  <Link key={m.id} href={linkEmpresa(m.empresa_id)}>
                    <span>
                      {m.empresa}
                      <br />
                      <span className="small muted">
                        {MOTIVOS[m.motivo] ?? m.motivo}
                        {m.justificativa && ` · ${m.justificativa}`} · {quando(m.criado_em)}
                      </span>
                    </span>
                    <b className="num" style={{ color: m.delta > 0 ? "var(--ok)" : "var(--ink)" }}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </b>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Vazio titulo="Nenhum crédito lançado ainda" texto="Planos vendidos e ajustes da equipe aparecem aqui." />
          )}
        </div>
      </div>
      <div className="panel">
        <div className="panel-h">
          <h2>Empresas</h2>
          <Link className="small" href="/admin/empresas">
            Ver todas ({n(totalEmpresas)})
          </Link>
        </div>
        {listaEmpresas.length ? (
          <TabelaEmpresas empresas={listaEmpresas} href={linkEmpresa} />
        ) : (
          <Vazio titulo="Nenhuma empresa cadastrada ainda" />
        )}
      </div>
      <div className="panel">
        <div className="panel-h">
          <h2>Últimas liberações</h2>
          <Link className="small" href="/admin/liberacoes">
            Ver todas
          </Link>
        </div>
        <ListaLiberacoes itens={(liberacoes.data ?? []) as LiberacaoAdmin[]} />
      </div>
    </>
  );
}
