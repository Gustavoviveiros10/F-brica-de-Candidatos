import { supabaseServer } from "@/lib/supabase/server";
import { comParametros } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Paginacao } from "@/components/admin/blocos";
import { ListaLiberacoes, type LiberacaoAdmin } from "@/components/admin/lista-liberacoes";

export const metadata = { title: "Liberações · Painel admin" };

const POR_PAGINA = 50;

export default async function AdminLiberacoes({ searchParams }: { searchParams: Promise<{ q?: string; pagina?: string }> }) {
  const p = await searchParams;
  const q = (p.q ?? "").trim().slice(0, 80);
  const pagina = Math.max(1, Number(p.pagina) || 1);
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_liberacoes", { p_busca: q || null, p_limite: POR_PAGINA, p_offset: (pagina - 1) * POR_PAGINA });
  if (error) throw new Error(error.message);
  const itens = (data ?? []) as LiberacaoAdmin[];
  const total = Number(itens[0]?.total ?? 0);

  return (
    <>
      <CabecalhoPagina titulo="Liberações" texto="Cada contato liberado, por qual empresa e em que etapa a empresa está com o candidato." />
      <div className="adm-busca">
        <span className="small muted">{total ? `${total.toLocaleString("pt-BR")} liberações` : ""}</span>
        <form action="/admin/liberacoes" role="search">
          <input className="input" name="q" defaultValue={q} placeholder="Buscar por empresa ou função" aria-label="Buscar liberação" />
        </form>
      </div>
      <div className="panel">
        <ListaLiberacoes itens={itens} />
        <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} href={(pg) => comParametros("/admin/liberacoes", { q: q || undefined }, { pagina: pg > 1 ? String(pg) : null })} />
      </div>
    </>
  );
}
