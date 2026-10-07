"use server";
import { revalidatePath } from "next/cache";
import { mensagemErro } from "@/lib/erros";
import { supabaseServer } from "@/lib/supabase/server";

export type Contato = { nome: string; whatsapp: string; email: string | null; cv_url: string | null };
export type ResultadoLiberar = { contato?: Contato; erro?: string; semCreditos?: boolean } | null;

// Debita 1 crédito (só na primeira vez) e devolve o contato. Toda a regra mora em liberar_contato no banco.
export async function liberarContato(candidatoId: string): Promise<ResultadoLiberar> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("liberar_contato", { p_candidato_id: candidatoId }).maybeSingle<Contato & { ja_liberado: boolean }>();
  if (error) return { erro: mensagemErro(error), semCreditos: error.message.includes("SEM_CREDITOS") };
  if (!data) return { erro: "Contato não encontrado." };
  if (!data.ja_liberado) revalidatePath("/app", "layout");
  return { contato: { nome: data.nome, whatsapp: data.whatsapp, email: data.email, cv_url: data.cv_url } };
}
