import { exigirEmpresa } from "@/lib/conta";
import { MENSAGEM_PADRAO } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { FormEmpresa, FormMeusDados, FormSenha } from "./forms";

export const metadata = { title: "Configurações · Fábrica de Candidatos" };

export default async function Configuracoes() {
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const [{ data: emp }, { data: auth }] = await Promise.all([
    supabase.from("empresas").select("whatsapp,municipio_id,municipios(uf)").eq("id", empresa.id).maybeSingle(),
    supabase.auth.getUser(),
  ]);
  const uf = (emp?.municipios as { uf?: string } | null)?.uf;

  return (
    <>
      <CabecalhoPagina titulo="Configurações" texto="Dados da empresa, mensagem do WhatsApp e seu acesso." />
      <div className="panel">
        <div className="panel-h"><h2>Empresa</h2></div>
        <div className="panel-b">
          <FormEmpresa
            mensagemPadrao={MENSAGEM_PADRAO}
            d={{
              nome: empresa.nome,
              cnpj: empresa.cnpj,
              whatsapp: emp?.whatsapp ?? "",
              uf,
              municipioId: emp?.municipio_id ?? null,
              mensagem: empresa.mensagem_whatsapp ?? "",
              podeEditar: empresa.papel === "admin",
            }}
          />
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><h2>Seus dados</h2></div>
        <div className="panel-b">
          <FormMeusDados nome={empresa.usuario_nome} email={auth.user?.email ?? ""} />
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><h2>Senha</h2></div>
        <div className="panel-b">
          <FormSenha />
        </div>
      </div>
    </>
  );
}
