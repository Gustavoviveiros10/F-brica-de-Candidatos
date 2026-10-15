import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { MOTIVOS, comParametros, n, quando } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Paginacao, Vazio } from "@/components/admin/blocos";

export const metadata = { title: "Créditos · Painel admin" };

const POR_PAGINA = 50;
type Movimento = { id: number; criado_em: string; empresa_id: string; empresa: string; delta: number; motivo: string; justificativa: string | null; total: number };

export default async function AdminCreditos({ searchParams }: { searchParams: Promise<{ motivo?: string; pagina?: string }> }) {
  const p = await searchParams;
  const motivo = p.motivo && p.motivo in MOTIVOS ? p.motivo : "";
  const pagina = Math.max(1, Number(p.pagina) || 1);
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_creditos", { p_motivo: motivo || null, p_limite: POR_PAGINA, p_offset: (pagina - 1) * POR_PAGINA });
  if (error) throw new Error(error.message);
  const movimentos = (data ?? []) as Movimento[];
  const total = Number(movimentos[0]?.total ?? 0);
  const atuais = { motivo: motivo || undefined };

  return (
    <>
      <CabecalhoPagina titulo="Créditos" texto="Extrato de todas as empresas: planos, testes grátis, ajustes e contatos liberados." />
      <div className="adm-busca">
        <nav className="adm-chips" aria-label="Filtrar por motivo">
          <Link href="/admin/creditos" aria-current={!motivo ? "true" : undefined}>
            Tudo
          </Link>
          {Object.entries(MOTIVOS).map(([v, rotulo]) => (
            <Link key={v} href={`/admin/creditos?motivo=${v}`} aria-current={motivo === v ? "true" : undefined}>
              {rotulo}
            </Link>
          ))}
        </nav>
      </div>
      <div className="panel">
        {movimentos.length ? (
          <>
            <div className="table-wrap">
              <table className="t">
                <thead>
                  <tr>
                    <th>Quando</th>
                    <th>Empresa</th>
                    <th>Motivo</th>
                    <th className="n">Créditos</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.map((m) => (
                    <tr key={m.id} className="adm-linha">
                      <td>{quando(m.criado_em)}</td>
                      <td>
                        <Link className="adm-link-linha" href={`/admin/empresas?id=${m.empresa_id}`}>
                          <b>{m.empresa}</b>
                        </Link>
                      </td>
                      <td>
                        {MOTIVOS[m.motivo] ?? m.motivo}
                        {m.justificativa && <span className="sub">{m.justificativa}</span>}
                      </td>
                      <td className="n">
                        <b style={{ color: m.delta > 0 ? "var(--ok)" : "var(--ink)" }}>{m.delta > 0 ? `+${n(m.delta)}` : n(m.delta)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} href={(pg) => comParametros("/admin/creditos", atuais, { pagina: pg > 1 ? String(pg) : null })} />
          </>
        ) : (
          <Vazio titulo="Nenhum movimento" texto={motivo ? "Nada com esse motivo ainda." : undefined} />
        )}
      </div>
    </>
  );
}
