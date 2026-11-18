"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { origemSite } from "@/lib/origem";
import type { EstadoForm } from "../entrar/actions";

export async function recuperar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const email = String(form.get("email") ?? "").trim();
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origemSite()}/auth/callback?next=/nova-senha`,
  });
  // Pedido repetido em menos de 1 minuto: nenhum e-mail novo sai. Avisar, senão a pessoa
  // espera um link que não vem e abre um antigo (que já não vale).
  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    return { erro: "Você acabou de pedir um link. Espere 1 minuto antes de pedir outro e, enquanto isso, use o link do e-mail mais recente." };
  }
  // Mesma resposta exista ou não a conta, para não revelar e-mails cadastrados.
  return {
    ok: `Se existir uma conta com ${email}, enviamos um link para criar uma nova senha. Use só o e-mail mais recente: cada pedido novo cancela os links anteriores.`,
  };
}
