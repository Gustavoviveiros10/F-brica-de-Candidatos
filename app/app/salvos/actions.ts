"use server";
import { revalidatePath } from "next/cache";
import { minhaConta } from "@/lib/conta";
import { supabaseServer } from "@/lib/supabase/server";

// Marca ou desmarca o candidato como salvo pela empresa. Devolve false se não deu.
export async function alternarSalvo(candidatoId: string, salvar: boolean): Promise<boolean> {
  const conta = await minhaConta();
  if (!conta.empresa || !conta.user_id) return false;
  const supabase = await supabaseServer();
  const { error } = salvar
    ? await supabase
        .from("salvos")
        .upsert({ empresa_id: conta.empresa.id, candidato_id: candidatoId, user_id: conta.user_id }, { onConflict: "empresa_id,candidato_id", ignoreDuplicates: true })
    : await supabase.from("salvos").delete().eq("empresa_id", conta.empresa.id).eq("candidato_id", candidatoId);
  revalidatePath("/app/salvos");
  return !error;
}
