import { createClient } from "@supabase/supabase-js";

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

// Preenche o HTML da home com a contagem por categoria.
export async function montarHome(base: string) {
  const totais = await contagens();
  // Card de função sem nenhum candidato na base sai da home até chegar alguém.
  const semCandidatos = (cat: string) => Object.keys(totais).length > 0 && !totais[cat];
  return base
    .replace(
      /<a class="cat-card" href="\/app\/busca\?categoria=([a-z]+)">[\s\S]*?<\/a>/g,
      (card, cat: string) => (semCandidatos(cat) ? "" : card),
    )
    .replace(/\{\{CAT:([a-z]+)\}\}/g, (_, cat: string) =>
      totais[cat] ? `<span data-count="${totais[cat]}">${totais[cat].toLocaleString("pt-BR")}</span>` : "Novos",
    );
}
