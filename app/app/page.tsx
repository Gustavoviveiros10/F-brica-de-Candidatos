import { exigirEmpresa } from "@/lib/conta";
import { supabaseServer } from "@/lib/supabase/server";
import { LayoutComando, type Resumo, type UltimoLiberado } from "@/components/visao-geral";

export const metadata = { title: "Visão geral · Fábrica de Candidatos" };

const VAZIO: Resumo = {
  cidade: null,
  regiao: { total: 0, quentes: 0, imediatos: 0, novos_7d: 0, por_categoria: {} },
  funil: {},
  parados: 0,
  salvos: 0,
  creditos_mes: 0,
  buscas: [],
};

export default async function VisaoGeral({ searchParams }: { searchParams: Promise<{ bemvindo?: string }> }) {
  const { bemvindo } = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();
  const [{ data: resumo }, { data: ultimos }] = await Promise.all([
    supabase.rpc("painel_resumo"),
    supabase.rpc("meus_contatos_liberados", { p_limite: 5, p_offset: 0 }),
  ]);

  return (
    <LayoutComando
      d={{
        nome: empresa.usuario_nome.split(" ")[0],
        saldo: empresa.saldo_creditos,
        teste: empresa.status === "teste",
        bemvindo: Boolean(bemvindo),
        resumo: (resumo as Resumo | null) ?? VAZIO,
        ultimos: (ultimos ?? []) as UltimoLiberado[],
      }}
    />
  );
}
