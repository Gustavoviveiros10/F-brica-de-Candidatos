import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { MENSAGEM_PADRAO } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import type { Candidato } from "@/lib/tipos";
import { comPrimeiroNome } from "@/lib/primeiros-nomes";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { CartaoCandidato } from "@/components/cartao-candidato";

export const metadata = { title: "Candidatos salvos · Fábrica de Candidatos" };

export default async function Salvos() {
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("meus_salvos", { p_limite: 100, p_offset: 0 });
  const lista = await comPrimeiroNome(supabase, (data ?? []) as Candidato[]);

  return (
    <>
      <CabecalhoPagina titulo="Candidatos salvos" texto="Perfis que você marcou com estrela para decidir depois." />
      {lista.length ? (
        lista.map((c) => (
          <CartaoCandidato key={c.id} c={c} empresa={empresa.nome} modelo={empresa.mensagem_whatsapp || MENSAGEM_PADRAO} saldo={empresa.saldo_creditos} />
        ))
      ) : (
        <div className="panel">
          <div className="empty">
            <b>Nenhum candidato salvo</b>Na busca, toque na estrela para guardar quem você quer ver de novo.
            <br />
            <Link className="btn btn-primary" href="/app/busca">Buscar candidatos</Link>
          </div>
        </div>
      )}
    </>
  );
}
