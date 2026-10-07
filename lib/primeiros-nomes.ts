import type { SupabaseClient } from "@supabase/supabase-js";

// Junta o primeiro nome (liberado antes do crédito) às linhas de candidatos.
export async function comPrimeiroNome<T extends { id: string }>(supabase: SupabaseClient, linhas: T[]) {
  if (!linhas.length) return linhas;
  const { data } = await supabase.rpc("primeiros_nomes", { p_ids: linhas.map((l) => l.id) });
  const nomes = new Map(((data ?? []) as { id: string; primeiro_nome: string }[]).map((n) => [n.id, n.primeiro_nome]));
  return linhas.map((l) => ({ ...l, primeiro_nome: nomes.get(l.id) ?? null }));
}
