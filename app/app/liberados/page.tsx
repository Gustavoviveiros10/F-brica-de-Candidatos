import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { ETAPAS } from "@/lib/etapas";
import { MENSAGEM_PADRAO } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import type { ContatoCrm } from "@/lib/tipos";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { CrmLiberados } from "@/components/crm-liberados";

export const metadata = { title: "Contatos liberados · Fábrica de Candidatos" };

export default async function Liberados({ searchParams }: { searchParams: Promise<{ etapa?: string }> }) {
  const { etapa } = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("crm_liberados", { p_limite: 500 });
  const contatos = (data ?? []) as ContatoCrm[];

  return (
    <>
      <CabecalhoPagina titulo="Contatos liberados" texto="Acompanhe cada candidato no processo. Abrir a ficha de novo não gasta crédito." />
      {contatos.length ? (
        <CrmLiberados contatos={contatos} empresa={empresa.nome} modelo={empresa.mensagem_whatsapp || MENSAGEM_PADRAO}
          etapaInicial={ETAPAS.some((e) => e.id === etapa) ? etapa : null}
        />
      ) : (
        <div className="panel">
          <div className="empty">
            <b>Nada liberado ainda</b>Use um dos seus créditos no candidato que mais combina com a vaga.
            <br />
            <Link className="btn btn-primary" href="/app/busca">Buscar candidatos</Link>
          </div>
        </div>
      )}
    </>
  );
}
