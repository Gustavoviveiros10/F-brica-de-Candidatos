import { exigirEmpresa } from "@/lib/conta";
import { data as fdata, reais } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";

export const metadata = { title: "Faturas · Fábrica de Candidatos" };

const STATUS: Record<string, string> = { pendente: "Pendente", pago: "Pago", falhou: "Falhou", estornado: "Estornado", cancelado: "Cancelado" };
type Pagamento = { id: string; valor_centavos: number; metodo: string | null; status: string; pago_em: string | null; criado_em: string };

export default async function Faturas() {
  await exigirEmpresa();
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("pagamentos")
    .select("id,valor_centavos,metodo,status,pago_em,criado_em")
    .order("criado_em", { ascending: false })
    .limit(50);
  const lista = (data ?? []) as Pagamento[];

  return (
    <>
      <CabecalhoPagina titulo="Faturas" texto="Pagamentos do seu plano." />
      <div className="panel">
        {lista.length ? (
          <div className="panel-b">
            <div className="list">
              {lista.map((p) => (
                <div key={p.id}>
                  <span>
                    <b>{reais(p.valor_centavos)}</b>
                    <br />
                    <span className="small muted">
                      {fdata(p.pago_em ?? p.criado_em)}
                      {p.metodo && ` · ${p.metodo === "pix" ? "Pix" : "Cartão"}`}
                    </span>
                  </span>
                  <span className={`chip ${p.status === "pago" ? "chip-ok" : ""}`}>{STATUS[p.status] ?? p.status}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty">
            <b>Nenhuma fatura ainda</b>Quando você assinar um plano, os pagamentos aparecem aqui.
          </div>
        )}
      </div>
    </>
  );
}
