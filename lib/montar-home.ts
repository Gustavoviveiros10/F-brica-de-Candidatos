import { createClient } from "@supabase/supabase-js";
import { secaoRanking, type RankingHome } from "@/lib/ranking-home";

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

// Preenche o HTML da home com a contagem por categoria e o ranking.
export async function montarHome(base: string) {
  const [totais, rank] = await Promise.all([contagens(), ranking()]);
  // Card de função sem nenhum candidato na base sai da home até chegar alguém.
  const semCandidatos = (cat: string) => Object.keys(totais).length > 0 && !totais[cat];
  return base
    .replace(
      /<a class="cat-card" href="\/app\/busca\?categoria=([a-z]+)">[\s\S]*?<\/a>/g,
      (card, cat: string) => (semCandidatos(cat) ? "" : card),
    )
    .replace(/\{\{CAT:([a-z]+)\}\}/g, (_, cat: string) =>
      totais[cat] ? `<span data-count="${totais[cat]}">${totais[cat].toLocaleString("pt-BR")}</span>` : "Novos",
    )
    .replace("{{RANKING}}", secaoRanking(rank));
}
