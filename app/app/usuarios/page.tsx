import { exigirEmpresa } from "@/lib/conta";
import { data as fdata, iniciais } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";

export const metadata = { title: "Usuários · Fábrica de Candidatos" };

const PAPEIS: Record<string, string> = { admin: "Administrador", recrutador: "Recrutador" };
type Usuario = { user_id: string; nome: string; email: string; papel: string; criado_em: string; sou_eu: boolean };

export default async function Usuarios() {
  await exigirEmpresa();
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("usuarios_da_empresa");
  const lista = (data ?? []) as Usuario[];

  return (
    <>
      <CabecalhoPagina titulo="Usuários" texto="Quem da sua empresa acessa a Fábrica. Todos usam os mesmos créditos." />
      <div className="panel">
        <div className="panel-b">
          <div className="list">
            {lista.map((u) => (
              <div key={u.user_id}>
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="av" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand-soft-ink)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13.5, flex: "none" }}>
                    {iniciais(u.nome)}
                  </span>
                  <span>
                    <b>{u.nome}</b>
                    {u.sou_eu && <span className="small muted"> (você)</span>}
                    <br />
                    <span className="small muted">{u.email} · desde {fdata(u.criado_em)}</span>
                  </span>
                </span>
                <span className="chip">{PAPEIS[u.papel] ?? u.papel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="banner">
        <span>
          <b>Convidar usuários:</b> em breve você vai poder chamar outras pessoas da empresa por e-mail.
        </span>
      </div>
    </>
  );
}
