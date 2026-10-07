import { createClient } from "@supabase/supabase-js";
import { HOME_HTML } from "@/lib/content/home";

// A home é estática e revalida a cada hora (contagem por categoria).
export const revalidate = 3600;

async function contagens(): Promise<Record<string, number>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data } = await supabase.rpc("contagem_por_categoria");
    return Object.fromEntries((data ?? []).map((r: { categoria: string; total: number }) => [r.categoria, Number(r.total)]));
  } catch {
    return {};
  }
}

export default async function Home() {
  const totais = await contagens();
  const html = HOME_HTML.replace(/\{\{CAT:([a-z]+)\}\}/g, (_, cat: string) =>
    totais[cat] ? totais[cat].toLocaleString("pt-BR") : "Novos",
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
