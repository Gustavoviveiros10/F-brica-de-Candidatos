import { createClient } from "@supabase/supabase-js";
import { HOME_HTML } from "@/lib/content/home";
import { secaoRanking, type RankingHome } from "@/lib/ranking-home";
import { MovimentoHome } from "@/components/movimento-home";

// A home é estática e revalida a cada hora (contagem por categoria e ranking).
export const revalidate = 3600;

function cliente() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function contagens(): Promise<Record<string, number>> {
  try {
    const { data } = await cliente().rpc("contagem_por_categoria");
    return Object.fromEntries((data ?? []).map((r: { categoria: string; total: number }) => [r.categoria, Number(r.total)]));
  } catch {
    return {};
  }
}

async function ranking(): Promise<RankingHome | null> {
  try {
    const { data } = await cliente().rpc("ranking_home");
    if (!data) return null;
    const normalizar = (itens: { nome: string; total: number }[] | null) =>
      (itens ?? []).map((i) => ({ nome: i.nome, total: Number(i.total) }));
    return { funcoes: normalizar(data.funcoes), cidades: normalizar(data.cidades) };
  } catch {
    return null;
  }
}

export default async function Home() {
  const [totais, rank] = await Promise.all([contagens(), ranking()]);
  const html = HOME_HTML.replace(/\{\{CAT:([a-z]+)\}\}/g, (_, cat: string) =>
    totais[cat] ? `<span data-count="${totais[cat]}">${totais[cat].toLocaleString("pt-BR")}</span>` : "Novos",
  ).replace("{{RANKING}}", secaoRanking(rank));
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <MovimentoHome />
    </>
  );
}
