import { redirect } from "next/navigation";
import { TelaAuth } from "@/components/marca";
import { minhaConta } from "@/lib/conta";
import { criarEmpresa } from "@/lib/empresa";
import { supabaseServer } from "@/lib/supabase/server";
import { FormCompletar } from "./form";

export const metadata = { title: "Complete o cadastro · Fábrica de Candidatos" };

export default async function CompletarCadastro() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/entrar?voltar=/completar-cadastro");
  if ((await minhaConta()).empresa) redirect("/app");

  // Quem confirmou o e-mail já deixou os dados da empresa no cadastro: tenta concluir sozinho.
  const m = data.user.user_metadata ?? {};
  let erro: string | undefined;
  if (m.empresa && m.cnpj && m.whatsapp && m.municipio_id && m.nome) {
    erro = (await criarEmpresa({ empresa: m.empresa, cnpj: m.cnpj, whatsapp: m.whatsapp, municipio_id: Number(m.municipio_id), nome: m.nome })) ?? undefined;
    if (!erro) redirect("/app?bemvindo=1");
  }

  let uf: string | undefined;
  if (m.municipio_id) {
    const { data: mun } = await supabase.from("municipios").select("uf").eq("id", m.municipio_id).maybeSingle();
    uf = mun?.uf;
  }

  return (
    <TelaAuth titulo="Falta pouco." texto="Com a empresa cadastrada você já pode buscar e liberar seus 2 contatos grátis.">
      <h1 className="display">Dados da empresa</h1>
      <p className="muted">Confira os dados para liberar o acesso.</p>
      <FormCompletar
        nome={m.nome ?? ""}
        erroInicial={erro}
        iniciais={{ empresa: m.empresa, cnpj: m.cnpj, whatsapp: m.whatsapp?.replace(/^\+55/, ""), uf, municipio_id: m.municipio_id }}
      />
    </TelaAuth>
  );
}
