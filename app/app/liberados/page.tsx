import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { MENSAGEM_PADRAO, data as fdata, linkWhatsApp } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { SeletorEtapa } from "@/components/seletor-etapa";

export const metadata = { title: "Contatos liberados · Fábrica de Candidatos" };

const POR_PAGINA = 50;

type Liberado = {
  liberacao_id: string; candidato_id: string; funcao: string; cidade: string; uf: string;
  nome: string; whatsapp: string; email: string | null; etapa: string; liberado_em: string; total: number;
};

export default async function Liberados({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const pagina = Math.max(1, Number((await searchParams).pagina) || 1);
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("meus_contatos_liberados", { p_limite: POR_PAGINA, p_offset: (pagina - 1) * POR_PAGINA });
  const lista = (data ?? []) as Liberado[];
  const total = Number(lista[0]?.total ?? 0);
  const paginas = Math.ceil(total / POR_PAGINA);
  const modelo = empresa.mensagem_whatsapp || MENSAGEM_PADRAO;

  return (
    <>
      <CabecalhoPagina titulo="Contatos liberados" texto="Quem você já liberou fica aqui. Abrir de novo não gasta crédito." />
      <div className="panel">
        {lista.length ? (
          <div className="panel-b">
            <div className="list">
              {lista.map((c) => (
                <div key={c.liberacao_id} style={{ flexWrap: "wrap" }}>
                  <span style={{ minWidth: 220, flex: 1 }}>
                    <b>{c.nome}</b>
                    <br />
                    <span className="small muted">
                      {c.funcao} · {c.cidade}/{c.uf} · liberado em {fdata(c.liberado_em)}
                      {c.email && <> · {c.email}</>}
                    </span>
                  </span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <SeletorEtapa liberacaoId={c.liberacao_id} etapa={c.etapa} />
                    <a
                      className="btn btn-wa btn-sm"
                      href={linkWhatsApp(c.whatsapp, modelo, { nome: c.nome, cargo: c.funcao, empresa: empresa.nome })}
                      target="_blank"
                      rel="noopener"
                    >
                      <Icon name="wa" /> WhatsApp
                    </a>
                  </span>
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
      {paginas > 1 && (
        <nav className="pager" aria-label="Páginas">
          {pagina > 1 && <Link className="btn btn-secondary btn-sm" href={`/app/liberados?pagina=${pagina - 1}`}>Anterior</Link>}
          <span className="muted">Página {pagina} de {paginas}</span>
          {pagina < paginas && <Link className="btn btn-secondary btn-sm" href={`/app/liberados?pagina=${pagina + 1}`}>Próxima</Link>}
        </nav>
      )}
    </>
  );
}
