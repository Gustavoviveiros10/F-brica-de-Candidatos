"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

const ETAPAS = ["novo", "contatado", "conversando", "entrevista", "aprovado", "contratado", "descartado"];

// RLS só deixa a empresa mexer em etapa e nota das próprias liberações.
export async function mudarEtapa(liberacaoId: string, etapa: string): Promise<boolean> {
  if (!ETAPAS.includes(etapa)) return false;
  const supabase = await supabaseServer();
  const { error } = await supabase.from("liberacoes").update({ etapa }).eq("id", liberacaoId);
  revalidatePath("/app/liberados");
  return !error;
}

export async function salvarNota(liberacaoId: string, nota: string): Promise<boolean> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("liberacoes")
    .update({ nota: nota.trim().slice(0, 2000) || null })
    .eq("id", liberacaoId);
  revalidatePath("/app/liberados");
  return !error;
}
