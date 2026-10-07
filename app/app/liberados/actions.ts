"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

const ETAPAS = ["novo", "contatado", "conversando", "entrevista", "aprovado", "contratado", "descartado"];

// RLS só deixa a empresa mexer em etapa e nota das próprias liberações.
export async function mudarEtapa(liberacaoId: string, etapa: string) {
  if (!ETAPAS.includes(etapa)) return;
  const supabase = await supabaseServer();
  await supabase.from("liberacoes").update({ etapa }).eq("id", liberacaoId);
  revalidatePath("/app/liberados");
}
